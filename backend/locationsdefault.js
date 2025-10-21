// scripts/importData.js
import { PrismaClient } from './generated/prisma/client.js';
import fs from 'fs';

const prisma = new PrismaClient();


await prisma.service.updateMany({
    data : {
        locationLat : 31.0345728,
        locationLon : 30.4676864
    },
});

console.log("Done updating services with default location.");