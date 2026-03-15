import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashSync } from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // ─── Facility Configuration ───
  const facility = await prisma.facilityConfiguration.upsert({
    where: { id: "facility-001" },
    update: {},
    create: {
      id: "facility-001",
      facilityName: "Horizon Re-Entry Center",
      overdueThresholdMinutes: 15,
      awolThresholdMinutes: 120,
      passGenerationTime: "22:00",
      maximumHoursOut: 14,
      earlyDepartureWindowMin: 15,
      qrCodeExpiryHours: 24,
      audioAlertsEnabled: true,
      selfApprovalEnabled: true,
      timezone: "America/New_York",
    },
  });
  console.log(`  ✓ Facility: ${facility.facilityName}`);

  // ─── Users ───
  const password = hashSync("Password123!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@reentry.local" },
    update: {},
    create: {
      email: "admin@reentry.local",
      name: "Diana Torres",
      role: "ADMIN",
      password,
    },
  });

  const cm1 = await prisma.user.upsert({
    where: { email: "cm.williams@reentry.local" },
    update: {},
    create: {
      email: "cm.williams@reentry.local",
      name: "Marcus Williams",
      role: "CASE_MANAGER",
      password,
    },
  });

  const cm2 = await prisma.user.upsert({
    where: { email: "cm.chen@reentry.local" },
    update: {},
    create: {
      email: "cm.chen@reentry.local",
      name: "Lisa Chen",
      role: "CASE_MANAGER",
      password,
    },
  });

  const es1 = await prisma.user.upsert({
    where: { email: "es.grant@reentry.local" },
    update: {},
    create: {
      email: "es.grant@reentry.local",
      name: "Robert Grant",
      role: "EMPLOYMENT_SPECIALIST",
      password,
    },
  });

  const fd1 = await prisma.user.upsert({
    where: { email: "fd.jackson@reentry.local" },
    update: {},
    create: {
      email: "fd.jackson@reentry.local",
      name: "Angela Jackson",
      role: "FRONT_DESK",
      password,
    },
  });

  const fd2 = await prisma.user.upsert({
    where: { email: "fd.martinez@reentry.local" },
    update: {},
    create: {
      email: "fd.martinez@reentry.local",
      name: "Carlos Martinez",
      role: "FRONT_DESK",
      password,
    },
  });

  console.log(
    `  ✓ Users: ${[admin, cm1, cm2, es1, fd1, fd2].map((u) => u.name).join(", ")}`
  );

  // ─── Residents ───
  const residents = await Promise.all([
    prisma.resident.upsert({
      where: { inmateNumber: "DOC-2024-44821" },
      update: {},
      create: {
        inmateNumber: "DOC-2024-44821",
        firstName: "James",
        lastName: "Mitchell",
        dateOfBirth: new Date("1989-04-12"),
        intakeDate: new Date("2026-01-15"),
        expectedReleaseDate: new Date("2026-09-15"),
        status: "IN_FACILITY",
        roomAssignment: "B-204",
        emergencyContactName: "Sarah Mitchell",
        emergencyContactPhone: "(555) 234-5678",
        conditions: "No travel beyond 15 miles of facility.",
        caseManagerId: cm1.id,
      },
    }),
    prisma.resident.upsert({
      where: { inmateNumber: "DOC-2024-51093" },
      update: {},
      create: {
        inmateNumber: "DOC-2024-51093",
        firstName: "Anthony",
        lastName: "Davis",
        dateOfBirth: new Date("1995-11-28"),
        intakeDate: new Date("2026-02-01"),
        expectedReleaseDate: new Date("2026-12-01"),
        status: "IN_FACILITY",
        roomAssignment: "A-112",
        emergencyContactName: "Maria Davis",
        emergencyContactPhone: "(555) 345-6789",
        caseManagerId: cm1.id,
      },
    }),
    prisma.resident.upsert({
      where: { inmateNumber: "DOC-2025-60284" },
      update: {},
      create: {
        inmateNumber: "DOC-2025-60284",
        firstName: "Kevin",
        lastName: "Thompson",
        dateOfBirth: new Date("1991-07-03"),
        intakeDate: new Date("2026-02-20"),
        expectedReleaseDate: new Date("2026-08-20"),
        status: "IN_FACILITY",
        roomAssignment: "B-108",
        emergencyContactName: "Patricia Thompson",
        emergencyContactPhone: "(555) 456-7890",
        conditions: "Must use public transit only.",
        caseManagerId: cm2.id,
      },
    }),
    prisma.resident.upsert({
      where: { inmateNumber: "DOC-2025-62117" },
      update: {},
      create: {
        inmateNumber: "DOC-2025-62117",
        firstName: "Derek",
        lastName: "Robinson",
        dateOfBirth: new Date("1987-01-19"),
        intakeDate: new Date("2026-03-01"),
        expectedReleaseDate: new Date("2027-03-01"),
        status: "IN_FACILITY",
        roomAssignment: "C-301",
        emergencyContactName: "Linda Robinson",
        emergencyContactPhone: "(555) 567-8901",
        caseManagerId: cm2.id,
      },
    }),
    prisma.resident.upsert({
      where: { inmateNumber: "DOC-2024-39855" },
      update: {},
      create: {
        inmateNumber: "DOC-2024-39855",
        firstName: "Michael",
        lastName: "Harris",
        dateOfBirth: new Date("1993-09-14"),
        intakeDate: new Date("2025-11-10"),
        expectedReleaseDate: new Date("2026-05-10"),
        status: "IN_FACILITY",
        roomAssignment: "A-105",
        emergencyContactName: "Donna Harris",
        emergencyContactPhone: "(555) 678-9012",
        caseManagerId: cm1.id,
      },
    }),
    // Extra residents for demo pass variety (10 names total with approved auths)
    prisma.resident.upsert({
      where: { inmateNumber: "DOC-2024-41200" },
      update: {},
      create: {
        inmateNumber: "DOC-2024-41200",
        firstName: "Carlos",
        lastName: "Martinez",
        dateOfBirth: new Date("1990-05-22"),
        intakeDate: new Date("2026-01-20"),
        expectedReleaseDate: new Date("2026-10-01"),
        status: "IN_FACILITY",
        roomAssignment: "B-210",
        emergencyContactName: "Rosa Martinez",
        emergencyContactPhone: "(555) 789-0123",
        caseManagerId: cm1.id,
      },
    }),
    prisma.resident.upsert({
      where: { inmateNumber: "DOC-2025-50111" },
      update: {},
      create: {
        inmateNumber: "DOC-2025-50111",
        firstName: "Jennifer",
        lastName: "Williams",
        dateOfBirth: new Date("1988-12-08"),
        intakeDate: new Date("2026-02-05"),
        expectedReleaseDate: new Date("2026-11-15"),
        status: "IN_FACILITY",
        roomAssignment: "C-205",
        emergencyContactName: "David Williams",
        emergencyContactPhone: "(555) 890-1234",
        caseManagerId: cm2.id,
      },
    }),
    prisma.resident.upsert({
      where: { inmateNumber: "DOC-2024-52333" },
      update: {},
      create: {
        inmateNumber: "DOC-2024-52333",
        firstName: "Marcus",
        lastName: "Johnson",
        dateOfBirth: new Date("1992-03-17"),
        intakeDate: new Date("2025-12-01"),
        expectedReleaseDate: new Date("2026-07-20"),
        status: "IN_FACILITY",
        roomAssignment: "A-208",
        emergencyContactName: "Tina Johnson",
        emergencyContactPhone: "(555) 901-2345",
        caseManagerId: cm1.id,
      },
    }),
    prisma.resident.upsert({
      where: { inmateNumber: "DOC-2025-61444" },
      update: {},
      create: {
        inmateNumber: "DOC-2025-61444",
        firstName: "Sandra",
        lastName: "Garcia",
        dateOfBirth: new Date("1985-08-30"),
        intakeDate: new Date("2026-03-01"),
        expectedReleaseDate: new Date("2027-01-10"),
        status: "IN_FACILITY",
        roomAssignment: "B-115",
        emergencyContactName: "Jose Garcia",
        emergencyContactPhone: "(555) 012-3456",
        caseManagerId: cm2.id,
      },
    }),
    prisma.resident.upsert({
      where: { inmateNumber: "DOC-2024-44555" },
      update: {},
      create: {
        inmateNumber: "DOC-2024-44555",
        firstName: "Robert",
        lastName: "Brown",
        dateOfBirth: new Date("1994-01-11"),
        intakeDate: new Date("2026-01-10"),
        expectedReleaseDate: new Date("2026-08-01"),
        status: "IN_FACILITY",
        roomAssignment: "C-102",
        emergencyContactName: "Nancy Brown",
        emergencyContactPhone: "(555) 123-4567",
        caseManagerId: cm1.id,
      },
    }),
    prisma.resident.upsert({
      where: { inmateNumber: "DOC-2025-62666" },
      update: {},
      create: {
        inmateNumber: "DOC-2025-62666",
        firstName: "Amanda",
        lastName: "Taylor",
        dateOfBirth: new Date("1991-06-25"),
        intakeDate: new Date("2026-02-15"),
        expectedReleaseDate: new Date("2026-12-15"),
        status: "IN_FACILITY",
        roomAssignment: "A-302",
        emergencyContactName: "Chris Taylor",
        emergencyContactPhone: "(555) 234-5678",
        caseManagerId: cm2.id,
      },
    }),
    prisma.resident.upsert({
      where: { inmateNumber: "DOC-2024-47777" },
      update: {},
      create: {
        inmateNumber: "DOC-2024-47777",
        firstName: "Daniel",
        lastName: "Wilson",
        dateOfBirth: new Date("1989-10-03"),
        intakeDate: new Date("2025-11-25"),
        expectedReleaseDate: new Date("2026-06-30"),
        status: "IN_FACILITY",
        roomAssignment: "B-301",
        emergencyContactName: "Karen Wilson",
        emergencyContactPhone: "(555) 345-6789",
        caseManagerId: cm1.id,
      },
    }),
    prisma.resident.upsert({
      where: { inmateNumber: "DOC-2025-63888" },
      update: {},
      create: {
        inmateNumber: "DOC-2025-63888",
        firstName: "Nicole",
        lastName: "Anderson",
        dateOfBirth: new Date("1993-04-19"),
        intakeDate: new Date("2026-03-05"),
        expectedReleaseDate: new Date("2026-09-30"),
        status: "IN_FACILITY",
        roomAssignment: "C-208",
        emergencyContactName: "Steve Anderson",
        emergencyContactPhone: "(555) 456-7890",
        caseManagerId: cm2.id,
      },
    }),
  ]);

  console.log(
    `  ✓ Residents: ${residents.map((r) => `${r.firstName} ${r.lastName} (${r.inmateNumber})`).join(", ")}`
  );

  // ─── Employment Authorization (approved, for James Mitchell) ───
  const auth1 = await prisma.employmentAuthorization.upsert({
    where: { id: "auth-seed-001" },
    update: {},
    create: {
      id: "auth-seed-001",
      status: "APPROVED",
      employerName: "Metro Warehousing Inc.",
      employerAddress: "4520 Industrial Blvd, Suite 100",
      employerPhone: "(555) 111-2222",
      employerContact: "Tom Bradley",
      jobTitle: "Warehouse Associate",
      payRate: "$16.50/hr",
      employmentType: "FULL_TIME",
      scheduleType: "RECURRING",
      scheduleStartDate: new Date("2026-03-15"),
      scheduleEndDate: null,
      scheduleDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
      departureTime: "06:30",
      returnTime: "17:30",
      travelBufferMin: 30,
      transportationMethod: "PUBLIC_TRANSIT",
      transportationDetails: "Bus route 42, transfer at Central Station.",
      residentId: residents[0].id,
      requestedById: cm1.id,
      reviewedById: es1.id,
    },
  });

  // ─── Employment Authorization (pending, for Kevin Thompson) ───
  const auth2 = await prisma.employmentAuthorization.upsert({
    where: { id: "auth-seed-002" },
    update: {},
    create: {
      id: "auth-seed-002",
      status: "PENDING",
      employerName: "GreenScape Landscaping",
      employerAddress: "780 Oak Park Road",
      employerPhone: "(555) 333-4444",
      employerContact: "Maria Santos",
      jobTitle: "Groundskeeper",
      payRate: "$15.00/hr",
      employmentType: "FULL_TIME",
      scheduleType: "RECURRING",
      scheduleStartDate: new Date("2026-03-20"),
      scheduleEndDate: null,
      scheduleDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
      departureTime: "07:00",
      returnTime: "16:00",
      travelBufferMin: 30,
      transportationMethod: "PUBLIC_TRANSIT",
      transportationDetails: "Bus route 18 direct.",
      caseManagerNotes:
        "Resident has prior landscaping experience. Employer willing to accommodate schedule.",
      residentId: residents[2].id,
      requestedById: cm2.id,
    },
  });

  // ─── Employment Authorization (self-approved, for Anthony Davis) ───
  const auth3 = await prisma.employmentAuthorization.upsert({
    where: { id: "auth-seed-003" },
    update: {},
    create: {
      id: "auth-seed-003",
      status: "CM_SELF_APPROVED",
      employerName: "QuickBite Restaurant",
      employerAddress: "1200 Main Street",
      employerPhone: "(555) 555-6666",
      employerContact: "James Lee",
      jobTitle: "Line Cook",
      payRate: "$14.00/hr",
      employmentType: "PART_TIME",
      scheduleType: "RECURRING",
      scheduleStartDate: new Date("2026-03-12"),
      scheduleEndDate: null,
      scheduleDays: ["WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"],
      departureTime: "10:00",
      returnTime: "19:00",
      travelBufferMin: 20,
      transportationMethod: "WALKING",
      transportationDetails: "Employer is 0.4 miles from facility.",
      selfApprovedByCM: true,
      selfApprovalJustification:
        "Employer requires immediate start. ES unavailable (weekend). Resident has clean record.",
      selfApprovalTimestamp: new Date("2026-03-09T19:45:00Z"),
      residentId: residents[1].id,
      requestedById: cm1.id,
    },
  });

  // ─── Extra approved authorizations for demo pass variety (10 names) ───
  const auth4 = await prisma.employmentAuthorization.upsert({
    where: { id: "auth-seed-004" },
    update: {},
    create: {
      id: "auth-seed-004",
      status: "ES_RATIFIED",
      employerName: "City Auto Repair",
      employerAddress: "2100 Commerce Dr",
      employerPhone: "(555) 111-3333",
      employerContact: "Rick Torres",
      jobTitle: "Mechanic Helper",
      payRate: "$17.00/hr",
      employmentType: "FULL_TIME",
      scheduleType: "RECURRING",
      scheduleStartDate: new Date("2026-03-01"),
      scheduleEndDate: null,
      scheduleDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
      departureTime: "07:00",
      returnTime: "16:00",
      travelBufferMin: 45,
      transportationMethod: "PUBLIC_TRANSIT",
      transportationDetails: "Bus 7 to Commerce Dr.",
      residentId: residents[5].id,
      requestedById: cm1.id,
      reviewedById: es1.id,
    },
  });
  const auth5 = await prisma.employmentAuthorization.upsert({
    where: { id: "auth-seed-005" },
    update: {},
    create: {
      id: "auth-seed-005",
      status: "APPROVED",
      employerName: "Downtown Dental Group",
      employerAddress: "500 Medical Plaza",
      employerPhone: "(555) 222-4444",
      employerContact: "Dr. Susan Park",
      jobTitle: "Dental Assistant",
      payRate: "$18.50/hr",
      employmentType: "FULL_TIME",
      scheduleType: "RECURRING",
      scheduleStartDate: new Date("2026-03-10"),
      scheduleEndDate: null,
      scheduleDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
      departureTime: "08:00",
      returnTime: "17:00",
      travelBufferMin: 30,
      transportationMethod: "PUBLIC_TRANSIT",
      transportationDetails: "Light rail to Medical Plaza.",
      residentId: residents[6].id,
      requestedById: cm2.id,
      reviewedById: es1.id,
    },
  });
  const auth6 = await prisma.employmentAuthorization.upsert({
    where: { id: "auth-seed-006" },
    update: {},
    create: {
      id: "auth-seed-006",
      status: "APPROVED",
      employerName: "Fresh Foods Grocery",
      employerAddress: "880 Market St",
      employerPhone: "(555) 333-5555",
      employerContact: "Lisa Chen",
      jobTitle: "Stock Clerk",
      payRate: "$15.25/hr",
      employmentType: "FULL_TIME",
      scheduleType: "RECURRING",
      scheduleStartDate: new Date("2026-03-05"),
      scheduleEndDate: null,
      scheduleDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"],
      departureTime: "06:00",
      returnTime: "14:00",
      travelBufferMin: 25,
      transportationMethod: "WALKING",
      transportationDetails: "0.5 mi from facility.",
      residentId: residents[7].id,
      requestedById: cm1.id,
      reviewedById: es1.id,
    },
  });
  const auth7 = await prisma.employmentAuthorization.upsert({
    where: { id: "auth-seed-007" },
    update: {},
    create: {
      id: "auth-seed-007",
      status: "ES_RATIFIED",
      employerName: "Riverside Café",
      employerAddress: "120 River Walk",
      employerPhone: "(555) 444-6666",
      employerContact: "Elena Ruiz",
      jobTitle: "Server",
      payRate: "$14.00/hr + tips",
      employmentType: "PART_TIME",
      scheduleType: "RECURRING",
      scheduleStartDate: new Date("2026-03-08"),
      scheduleEndDate: null,
      scheduleDays: ["THURSDAY", "FRIDAY", "SATURDAY"],
      departureTime: "11:00",
      returnTime: "20:00",
      travelBufferMin: 20,
      transportationMethod: "PUBLIC_TRANSIT",
      transportationDetails: "Bus 12.",
      residentId: residents[8].id,
      requestedById: cm2.id,
      reviewedById: es1.id,
    },
  });
  const auth8 = await prisma.employmentAuthorization.upsert({
    where: { id: "auth-seed-008" },
    update: {},
    create: {
      id: "auth-seed-008",
      status: "APPROVED",
      employerName: "ABC Construction Co",
      employerAddress: "3400 Industrial Way",
      employerPhone: "(555) 555-7777",
      employerContact: "Mike O'Brien",
      jobTitle: "Laborer",
      payRate: "$19.00/hr",
      employmentType: "FULL_TIME",
      scheduleType: "RECURRING",
      scheduleStartDate: new Date("2026-02-28"),
      scheduleEndDate: null,
      scheduleDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
      departureTime: "06:30",
      returnTime: "15:30",
      travelBufferMin: 45,
      transportationMethod: "EMPLOYER_TRANSPORT",
      transportationDetails: "Van pickup at facility gate.",
      residentId: residents[9].id,
      requestedById: cm1.id,
      reviewedById: es1.id,
    },
  });
  const auth9 = await prisma.employmentAuthorization.upsert({
    where: { id: "auth-seed-009" },
    update: {},
    create: {
      id: "auth-seed-009",
      status: "APPROVED",
      employerName: "Tech Support Plus",
      employerAddress: "1500 Innovation Blvd",
      employerPhone: "(555) 666-8888",
      employerContact: "Amy Foster",
      jobTitle: "Customer Support Rep",
      payRate: "$16.00/hr",
      employmentType: "FULL_TIME",
      scheduleType: "RECURRING",
      scheduleStartDate: new Date("2026-03-12"),
      scheduleEndDate: null,
      scheduleDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
      departureTime: "08:30",
      returnTime: "17:00",
      travelBufferMin: 30,
      transportationMethod: "PUBLIC_TRANSIT",
      transportationDetails: "Bus 5 to Innovation Blvd.",
      residentId: residents[10].id,
      requestedById: cm2.id,
      reviewedById: es1.id,
    },
  });
  const auth10 = await prisma.employmentAuthorization.upsert({
    where: { id: "auth-seed-010" },
    update: {},
    create: {
      id: "auth-seed-010",
      status: "ES_RATIFIED",
      employerName: "Valley Cleaners",
      employerAddress: "200 Oak Ave",
      employerPhone: "(555) 777-9999",
      employerContact: "Helen Kim",
      jobTitle: "Press Operator",
      payRate: "$14.50/hr",
      employmentType: "PART_TIME",
      scheduleType: "RECURRING",
      scheduleStartDate: new Date("2026-03-06"),
      scheduleEndDate: null,
      scheduleDays: ["TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
      departureTime: "09:00",
      returnTime: "15:00",
      travelBufferMin: 20,
      transportationMethod: "WALKING",
      transportationDetails: "0.3 mi from facility.",
      residentId: residents[11].id,
      requestedById: cm1.id,
      reviewedById: es1.id,
    },
  });
  const auth11 = await prisma.employmentAuthorization.upsert({
    where: { id: "auth-seed-011" },
    update: {},
    create: {
      id: "auth-seed-011",
      status: "APPROVED",
      employerName: "Sunrise Bakery",
      employerAddress: "45 Baker Lane",
      employerPhone: "(555) 888-0000",
      employerContact: "Paul Nguyen",
      jobTitle: "Baker's Assistant",
      payRate: "$15.00/hr",
      employmentType: "FULL_TIME",
      scheduleType: "RECURRING",
      scheduleStartDate: new Date("2026-03-04"),
      scheduleEndDate: null,
      scheduleDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"],
      departureTime: "04:00",
      returnTime: "12:00",
      travelBufferMin: 25,
      transportationMethod: "PUBLIC_TRANSIT",
      transportationDetails: "Early bus 3.",
      residentId: residents[12].id,
      requestedById: cm2.id,
      reviewedById: es1.id,
    },
  });

  console.log(
    `  ✓ Authorizations: ${[auth1, auth2, auth3, auth4, auth5, auth6, auth7, auth8, auth9, auth10, auth11].map((a) => `${a.employerName} (${a.status})`).join(", ")}`
  );

  // ─── Notifications (sample) ───
  await prisma.notification.createMany({
    data: [
      {
        type: "NEW_REQUEST",
        title: "New Authorization Request",
        body: "Marcus Williams submitted an employment authorization for Kevin Thompson at GreenScape Landscaping.",
        recipientId: es1.id,
        relatedEntityType: "Authorization",
        relatedEntityId: auth2.id,
      },
      {
        type: "SELF_APPROVAL_ALERT",
        title: "CM Self-Approval Requires Review",
        body: "Marcus Williams self-approved an authorization for Anthony Davis at QuickBite Restaurant. Justification: Employer requires immediate start. ES unavailable (weekend).",
        recipientId: es1.id,
        relatedEntityType: "Authorization",
        relatedEntityId: auth3.id,
      },
      {
        type: "APPROVED",
        title: "Authorization Approved",
        body: "Robert Grant approved the employment authorization for James Mitchell at Metro Warehousing Inc.",
        recipientId: cm1.id,
        relatedEntityType: "Authorization",
        relatedEntityId: auth1.id,
        isRead: true,
      },
    ],
    skipDuplicates: true,
  });
  console.log("  ✓ Notifications: 3 sample notifications created");

  console.log("\nSeed complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
