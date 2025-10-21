// scripts/importData.js - Enhanced version with business registration and subscription support
import { PrismaClient } from './generated/prisma/client.js';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();



const services = await prisma.shop.updateMany({
    where: {
        designId: { in: ["e9c8f349-81b6-4e55-b00a-e6f653be48e8",'7768e950-3714-47c4-bfb2-aee66a557a64','6409bb24-a73b-43f2-bf55-496ebdab4e7b'] }
    },
    data:{
        designId : '98207f83-996d-4bf2-b4eb-e23440dd5349'
    }
})