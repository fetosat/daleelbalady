// booking.js
import express from "express";
import { PrismaClient } from "./generated/prisma/client.js";
import { z } from "zod";

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const BookingRequestSchema = z.object({
  serviceId: z.string().uuid(),
  userId: z.string().uuid(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  notes: z.string().optional(),
});

const TimeSlotRequestSchema = z.object({
  serviceId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD format
});

// Get available time slots for a service on a specific date
router.post("/available-slots", async (req, res) => {
  try {
    const { serviceId, date } = TimeSlotRequestSchema.parse(req.body);
    console.log("Fetching available slots for:", { serviceId, date });
    // Get service details
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        availability: true,
        bookings: {
          where: {
            startAt: {
              gte: new Date(date + "T00:00:00.000Z"),
              lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000).toISOString(),
            },
          },
        },
      },
    });

    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    // Default working hours if no availability is set
    const defaultStartTime = "09:00";
    const defaultEndTime = "21:00";
    const slotDuration = 30; // 30 minutes per slot

    // Get availability for the specific day of week
    const dayOfWeek = new Date(date).getDay();
    const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const currentDay = dayNames[dayOfWeek];

    let workingHours = { start: defaultStartTime, end: defaultEndTime };
    
    // Find availability for this day
    const dayAvailability = service.availability.find(av => av.dayOfWeek === currentDay);
    if (dayAvailability) {
      workingHours = {
        start: dayAvailability.startTime,
        end: dayAvailability.endTime,
      };
    }

    // Generate all possible time slots
    const timeSlots = generateTimeSlots(workingHours.start, workingHours.end, slotDuration);
    
    // Filter out booked slots
    const bookedSlots = service.bookings.map(booking => ({
      start: booking.startAt.toISOString(),
      end: booking.endAt.toISOString(),
    }));

    const availableSlots = timeSlots.filter(slot => {
      const slotStart = new Date(date + "T" + slot.start + ":00.000Z");
      const slotEnd = new Date(date + "T" + slot.end + ":00.000Z");
      
      return !bookedSlots.some(booked => {
        const bookedStart = new Date(booked.start);
        const bookedEnd = new Date(booked.end);
        
        // Check if slots overlap
        return (slotStart < bookedEnd && slotEnd > bookedStart);
      });
    });

    res.json({
      serviceId,
      date,
      availableSlots,
      workingHours,
      totalSlots: timeSlots.length,
      bookedSlots: bookedSlots.length,
    });

  } catch (error) {
    console.error("Error fetching available slots:", error);
    res.status(400).json({ error: error.message });
  }
});

// Create a new booking
router.post("/create", async (req, res) => {
  try {
    const { serviceId, userId, startAt, endAt, notes } = BookingRequestSchema.parse(req.body);
    
    // Validate that the time slot is still available
    const existingBookings = await prisma.booking.findMany({
      where: {
        serviceId,
        startAt: {
          gte: new Date(startAt),
          lt: new Date(endAt),
        },
      },
    });

    if (existingBookings.length > 0) {
      return res.status(409).json({ error: "Time slot is no longer available" });
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        serviceId,
        userId,
        startAt: new Date(startAt),
        endAt: new Date(endAt),
        durationMins: Math.round((new Date(endAt) - new Date(startAt)) / (1000 * 60)),
        notes,
        bookingRef: generateBookingRef(),
        status: "PENDING",
      },
      include: {
        service: {
          include: {
            translation: true,
            shop: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    res.json({
      success: true,
      booking,
      message: "Booking created successfully",
    });

  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(400).json({ error: error.message });
  }
});

// Get bookings for a service
router.get("/service/:serviceId", async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { date } = req.query;

    const whereClause = { serviceId };
    
    if (date) {
      const startOfDay = new Date(date + "T00:00:00.000Z");
      const endOfDay = new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000).toISOString();
      
      whereClause.startAt = {
        gte: startOfDay,
        lt: new Date(endOfDay),
      };
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        startAt: 'asc',
      },
    });

    res.json({ bookings });

  } catch (error) {
    console.error("Error fetching service bookings:", error);
    res.status(400).json({ error: error.message });
  }
});

// Get user's bookings
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;

    const whereClause = { userId };
    if (status) {
      whereClause.status = status;
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        service: {
          include: {
            translation: true,
            shop: true,
          },
        },
      },
      orderBy: {
        startAt: 'desc',
      },
    });

    res.json({ bookings });

  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(400).json({ error: error.message });
  }
});

// Update booking status
router.patch("/:bookingId/status", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    if (!["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
      include: {
        service: {
          include: {
            translation: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    res.json({ booking });

  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(400).json({ error: error.message });
  }
});

// Helper function to generate time slots
function generateTimeSlots(startTime, endTime, durationMinutes) {
  const slots = [];
  const start = parseTime(startTime);
  const end = parseTime(endTime);
  
  let current = start;
  
  while (current < end) {
    const slotEnd = new Date(current.getTime() + durationMinutes * 60000);
    
    if (slotEnd <= end) {
      slots.push({
        start: formatTime(current),
        end: formatTime(slotEnd),
        duration: durationMinutes,
      });
    }
    
    current = slotEnd;
  }
  
  return slots;
}

// Helper function to parse time string (HH:MM) to Date
function parseTime(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

// Helper function to format Date to time string (HH:MM)
function formatTime(date) {
  return date.toTimeString().slice(0, 5);
}

// Helper function to generate booking reference
function generateBookingRef() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `DB-${timestamp}-${random}`.toUpperCase();
}

export default router;
