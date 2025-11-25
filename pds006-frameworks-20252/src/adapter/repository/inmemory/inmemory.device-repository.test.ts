import { Computer, DeviceCriteria, FrequentComputer, MedicalDevice } from "@/core/domain";
import { DeviceRepository } from "@/core/repository";
import { InMemoryDeviceRepository } from ".";

import { beforeEach, describe, expect, it } from "bun:test";

describe("DeviceRepository contract tests", () => {
  let repo: DeviceRepository;

  beforeEach(() => {
    /*
      Cambia al constructor de tu implementación
      Ej: new PostgresDeviceRepository()
    */
    repo = new InMemoryDeviceRepository();
  });

  it("registerFrequentComputer should persist and return a frequent computer", async () => {
    const computer: Computer = {
      id: "comp-1",
      brand: "Dell",
      model: "XPS",
      owner: { name: "Alice", id: "owner-1" },
      photoURL: new URL("http://example.com/photo.png"),
      updatedAt: new Date(),
      checkinAt: new Date(),
    };

    const frequent: FrequentComputer = {
      device: computer,
      checkinURL: new URL("http://example.com/checkin"),
      checkoutURL: new URL("http://example.com/checkout"),
    };

    const saved = await repo.registerFrequentComputer(frequent);
    expect(saved.device.id).toBe("comp-1");

    const results = await repo.getFrequentComputers({});
    expect(results.some(r => r.device.id === "comp-1")).toBe(true);
  });

  it("getMedicalDevices should return medical devices filtered by criteria", async () => {
    const device: MedicalDevice = {
      id: "med-1",
      brand: "MedTech",
      model: "HeartMonitor",
      owner: { name: "Clinic", id: "c-1" },
      updatedAt: new Date(),
      photoURL: new URL("http://example.com/photo2.png"),
      serial: "7312-1712-0719",
      checkinAt: new Date(),
    };

    await repo.checkinMedicalDevice(device);
    const devices = await repo.getMedicalDevices({});
    expect(devices.find(d => d.id === "med-1")).toBeDefined();
  });

  it("getComputers should return computers after check-in", async () => {
    const computer: Computer = {
      id: "comp-2",
      brand: "HP",
      model: "Elitebook",
      owner: { name: "Bob", id: "owner-2" },
      photoURL: new URL("http://example.com/photo2.png"),
      updatedAt: new Date(),
      checkinAt: new Date(),
    };

    await repo.checkinComputer(computer);
    const computers = await repo.getComputers({});
    expect(computers.some(c => c.id === "comp-2")).toBe(true);
  });

  it("getEnteredDevices should include all device types", async () => {
    const computer: Computer = {
      id: "comp-3",
      brand: "Lenovo",
      model: "ThinkPad",
      owner: { name: "Charlie", id: "owner-3" },
      photoURL: new URL("http://example.com/photo3.png"),
      updatedAt: new Date(),
      checkinAt: new Date(),
    };

    await repo.checkinComputer(computer);
    const entered = await repo.getEnteredDevices({});
    expect(entered.some(e => e.id === "comp-3")).toBe(true);
  });

  it("checkinComputer should set checkinAt timestamp", async () => {
    const computer: Computer = {
      id: "comp-4",
      brand: "Apple",
      model: "MacBook Pro",
      owner: { name: "Dana", id: "owner-4" },
      photoURL: new URL("http://example.com/photo4.png"),
      updatedAt: new Date(),
      checkinAt: new Date(),
    };

    const checkedIn = await repo.checkinComputer(computer);
    expect(checkedIn.checkinAt).toBeInstanceOf(Date);
  });

  it("checkinMedicalDevice should set checkinAt timestamp", async () => {
    const med: MedicalDevice = {
      id: "med-2",
      brand: "MedEquip",
      model: "Scanner",
      owner: { name: "Hospital", id: "h-1" },
      updatedAt: new Date(),
      photoURL: new URL("http://example.com/photo2.png"),
      serial: "7312-1712-0719",
      checkinAt: new Date(),
    };

    const checkedIn = await repo.checkinMedicalDevice(med);
    expect(checkedIn.checkinAt).toBeInstanceOf(Date);
  });

  it("checkinFrequentComputer should update checkinAt timestamp", async () => {
    const computer: Computer = {
      id: "comp-5",
      brand: "Asus",
      model: "ZenBook",
      owner: { name: "Eve", id: "owner-5" },
      photoURL: new URL("http://example.com/photo5.png"),
      updatedAt: new Date(),
    };

    const frequent: FrequentComputer = {
      device: computer,
      checkinURL: new URL("http://example.com/checkin"),
      checkoutURL: new URL("http://example.com/checkout"),
    };

    await repo.registerFrequentComputer(frequent);
    const checkedIn = await repo.checkinFrequentComputer("comp-5", new Date());
    expect(checkedIn.device.checkinAt).toBeInstanceOf(Date);
  });

  it("checkoutDevice should set checkoutAt timestamp", async () => {
    const computer: Computer = {
      id: "comp-6",
      brand: "Acer",
      model: "Swift",
      owner: { name: "Frank", id: "owner-6" },
      photoURL: new URL("http://example.com/photo6.png"),
      updatedAt: new Date(),
    };

    await repo.checkinComputer(computer);
    await repo.checkoutDevice("comp-6", new Date());

    const computers = await repo.getComputers({});
    const found = computers.find(c => c.id === "comp-6");
    expect(found?.checkoutAt).toBeInstanceOf(Date);
  });

  describe("DeviceCriteria behavior", () => {
    beforeEach(async () => {
      const now = Date.now();
      const brands = ["Dell", "HP", "Apple", "Lenovo", "Acer"];
      const owners = ["owner-1", "owner-2", "owner-3", "owner-4", "owner-5"];

      for (let i = 0; i < 5; i++) {
        const computer: Computer = {
          id: `crit-comp-${i}`,
          brand: brands[i],
          model: `Model-${i}`,
          owner: { name: `Owner-${i}`, id: owners[i] },
          photoURL: new URL(`http://example.com/photo${i}.png`),
          updatedAt: new Date(now + i * 1000),
          checkinAt: new Date(),
        };
        await repo.checkinComputer(computer);
      }
    });

    it("should filter by brand", async () => {
      const criteria: DeviceCriteria = {
        filterBy: { field: "brand", value: "Dell" },
      };
      const results = await repo.getComputers(criteria);
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(r => r.brand === "Dell")).toBe(true);
    });

    it("should filter by owner id", async () => {
      const criteria: DeviceCriteria = {
        filterBy: { field: "owner.id", value: "owner-3" },
      };
      const results = await repo.getComputers(criteria);
      expect(results.every(r => r.owner.id === "owner-3")).toBe(true);
    });

    it("should sort ascending by updatedAt", async () => {
      const criteria: DeviceCriteria = {
        sortBy: { field: "updatedAt", isAscending: true },
      };
      const results = await repo.getComputers(criteria);
      const timestamps = results.map(r => r.updatedAt.getTime());
      expect(timestamps).toEqual([...timestamps].sort((a, b) => a - b));
    });

    it("should sort descending by updatedAt", async () => {
      const criteria: DeviceCriteria = {
        sortBy: { field: "updatedAt", isAscending: false },
      };
      const results = await repo.getComputers(criteria);
      const timestamps = results.map(r => r.updatedAt.getTime());
      expect(timestamps).toEqual([...timestamps].sort((a, b) => b - a));
    });

    it("should apply pagination using limit and offset", async () => {
      const criteria: DeviceCriteria = { limit: 2, offset: 2 };
      const results = await repo.getComputers(criteria);
      expect(results.length).toBeLessThanOrEqual(2);
    });

    it("should combine filter, sort, and pagination", async () => {
      const criteria: DeviceCriteria = {
        filterBy: { field: "brand", value: "HP" },
        sortBy: { field: "updatedAt", isAscending: true },
        limit: 1,
        offset: 0,
      };
      const results = await repo.getComputers(criteria);
      expect(results.length).toBe(1);
      expect(results[0].brand).toBe("HP");
    });
  });
});

