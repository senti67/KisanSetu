const prisma = require("../src/lib/prisma");

async function main() {
  console.log("Seeding procurement centers...");

  const centers = [
    {
      name: "Karnal Main Grain Mandi (Gate 2)",
      location: "Karnal",
      district: "Karnal",
      operatingHours: "07:00 AM - 06:00 PM",
      dailyCapacity: 100,
    },
    {
      name: "Gharaunda Sub-Yard",
      location: "Gharaunda",
      district: "Karnal",
      operatingHours: "08:00 AM - 05:30 PM",
      dailyCapacity: 80,
    },
    {
      name: "Taraori Procurement Yard",
      location: "Taraori",
      district: "Karnal",
      operatingHours: "07:30 AM - 06:00 PM",
      dailyCapacity: 120,
    },
    {
      name: "Ambala City Grain Hub",
      location: "Ambala",
      district: "Ambala",
      operatingHours: "07:00 AM - 05:00 PM",
      dailyCapacity: 60,
    },
    {
      name: "Kurukshetra Sector 13 Yard",
      location: "Thanesar",
      district: "Kurukshetra",
      operatingHours: "08:00 AM - 06:00 PM",
      dailyCapacity: 90,
    },
  ];

  for (const centerData of centers) {
    const center = await prisma.procurementCenter.create({
      data: centerData,
    });

    console.log("Created center:", center.name);

    const slots = [
      ["07:00 AM", "09:00 AM"],
      ["09:00 AM", "11:00 AM"],
      ["11:00 AM", "01:00 PM"],
      ["02:00 PM", "04:00 PM"],
    ];

    for (const [startTime, endTime] of slots) {
      await prisma.procurementSlot.create({
        data: {
          centerId: center.id,
          date: new Date(),
          startTime,
          endTime,
          capacity: Math.floor(center.dailyCapacity / 4),
        },
      });
    }
  }

  console.log("Procurement centers and slots seeded successfully.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
