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

  console.log(
    `  ✓ Authorizations: ${[auth1, auth2, auth3].map((a) => `${a.employerName} (${a.status})`).join(", ")}`
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
