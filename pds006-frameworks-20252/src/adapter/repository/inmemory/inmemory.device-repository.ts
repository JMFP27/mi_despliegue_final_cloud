import { Computer, DeviceCriteria, DeviceId, EnteredDevice, FrequentComputer, MedicalDevice } from "../../../core/domain" // Alias corregido
import { SERVICE_ERRORS } from "../../../core/service/error" // Alias corregido
import { DeviceRepository } from "../../../core/repository" // Alias corregido

export class InMemoryDeviceRepository implements DeviceRepository {
  private frequentComputers = new Map<DeviceId, FrequentComputer>()
  private medicalDevices = new Map<DeviceId, MedicalDevice>()
  private computers = new Map<DeviceId, Computer>()
  private enteredDevices = new Map<DeviceId, EnteredDevice>()

  async registerFrequentComputer(computer: FrequentComputer): Promise<FrequentComputer> {
    this.frequentComputers.set(computer.device.id, computer)
    return computer
  }

  async getMedicalDevices(_criteria: DeviceCriteria): Promise<MedicalDevice[]> {
    const items = Array.from(this.medicalDevices.values())
    return this.applyCriteria(items, _criteria) as MedicalDevice[]
  }

  async getComputers(_criteria: DeviceCriteria): Promise<Computer[]> {
    const items = Array.from(this.computers.values())
    return this.applyCriteria(items, _criteria) as Computer[]
  }

  async getFrequentComputers(_criteria: DeviceCriteria): Promise<FrequentComputer[]> {
    const items = Array.from(this.frequentComputers.values())
    return this.applyCriteria(items, _criteria) as FrequentComputer[]
  }

  async getEnteredDevices(_criteria: DeviceCriteria): Promise<EnteredDevice[]> {
    const items = Array.from(this.enteredDevices.values())
    return this.applyCriteria(items, _criteria) as EnteredDevice[]
  }

  async checkinComputer(computer: Computer): Promise<Computer> {
    this.computers.set(computer.id, computer)
    this.enteredDevices.set(computer.id, this.mapDeviceFromComputer(computer))

    return computer
  }

  async checkinMedicalDevice(device: MedicalDevice): Promise<MedicalDevice> {
    this.medicalDevices.set(device.id, device)
    this.enteredDevices.set(device.id,this.mapDeviceFromMedical(device))

    return device
  }

  async checkinFrequentComputer(id: DeviceId, datetime: Date): Promise<FrequentComputer> {
    if (!this.frequentComputers.has(id)) {
      throw SERVICE_ERRORS.DeviceNotFound
    }

    const computer = this.frequentComputers.get(id)!

    computer.device.checkinAt = datetime
    computer.device.updatedAt = datetime

    this.enteredDevices.set(id, this.mapDeviceFromFrequentComputer(computer))

    return computer
  }

  async checkoutDevice(id: DeviceId, datetime: Date): Promise<void> {
      if (!this.enteredDevices.has(id)) {
        throw SERVICE_ERRORS.DeviceNotFound
      }

      const device = this.enteredDevices.get(id)!

      switch (device.type) {
        case "computer":
          this.computers.get(id)!.checkoutAt = datetime
          break;
        case "medical-device":
          this.medicalDevices.get(id)!.checkoutAt = datetime
          break;
        case "frequent-computer":
          this.frequentComputers.get(id)!.device.checkoutAt = datetime
          break;
      }

      this.enteredDevices.delete(id)
  }

  async isDeviceEntered(id: DeviceId): Promise<boolean> {
    return this.enteredDevices.has(id)
  }

  async isFrequentComputerRegistered(id: DeviceId): Promise<boolean> {
    return this.frequentComputers.has(id)
  }

  private mapDeviceFromFrequentComputer(computer: FrequentComputer): EnteredDevice {
    return {
      id: computer.device.id,
      brand: computer.device.brand,
      model: computer.device.model,
      owner: computer.device.owner,
      updatedAt: new Date(),
      type: "frequent-computer"
    }
  }

  private mapDeviceFromComputer(computer: Computer): EnteredDevice {
    return {
      id: computer.id,
      brand: computer.brand,
      model: computer.model,
      owner: computer.owner,
      updatedAt: new Date(),
      type: "computer"
    }
  }

  private mapDeviceFromMedical(medicalDevice: MedicalDevice): EnteredDevice {
    return {
      id: medicalDevice.id,
      brand: medicalDevice.brand,
      model: medicalDevice.model,
      owner: medicalDevice.owner,
      updatedAt: new Date(),
      type: "medical-device"
    }
  }

  // Apply filtering, sorting and pagination based on DeviceCriteria
  private applyCriteria<T extends Record<string, any>>(items: T[], criteria?: DeviceCriteria): T[] {
    if (!criteria) return items

    let out = items.slice()

    // Filtering
    if (criteria.filterBy && criteria.filterBy.field) {
      const path = criteria.filterBy.field.split('.')
      const value = criteria.filterBy.value
      out = out.filter(item => {
        let cur: any = item
        for (const p of path) {
          if (cur == null) return false
          cur = cur[p]
        }
        return cur === value
      })
    }

    // Sorting
    if (criteria.sortBy && criteria.sortBy.field) {
      const path = criteria.sortBy.field.split('.')
      out.sort((a, b) => {
        const va = this.getFieldValue(a, path)
        const vb = this.getFieldValue(b, path)

        // Handle Date objects
        const na = va instanceof Date ? va.getTime() : va
        const nb = vb instanceof Date ? vb.getTime() : vb

        if (na == null && nb == null) return 0
        if (na == null) return criteria.sortBy!.isAscending ? -1 : 1
        if (nb == null) return criteria.sortBy!.isAscending ? 1 : -1

        if (na < nb) return criteria.sortBy!.isAscending ? -1 : 1
        if (na > nb) return criteria.sortBy!.isAscending ? 1 : -1
        return 0
      })
    }

    // Pagination
    const offset = criteria.offset ?? 0
    const limit = criteria.limit ?? out.length
    out = out.slice(offset, offset + limit)

    return out
  }

  private getFieldValue(obj: any, path: string[]): any {
    let cur = obj
    for (const p of path) {
      if (cur == null) return undefined
      cur = cur[p]
    }
    return cur
  }
}
