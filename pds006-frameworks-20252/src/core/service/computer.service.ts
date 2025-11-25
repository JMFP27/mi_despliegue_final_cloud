import { COMPUTER_REQUEST_SCHEMA, ComputerRequest, mapRequestToComputer } from "@core/dto";
import { Computer, DeviceCriteria, DeviceId, FrequentComputer } from "@core/domain";
import { DevicePhotoRepository, DeviceRepository } from "@core/repository";
import { SERVICE_ERRORS } from "./error";
import { Helper } from "./helper";

export class ComputerService {

  constructor(
    private repository: DeviceRepository,
    private photoRepository: DevicePhotoRepository,
    private baseURL: URL,
  ) {}

  async getFrequentComputers(criteria: DeviceCriteria): Promise<FrequentComputer[]> {
    return this.repository.getFrequentComputers(criteria)
  }

  async getComputers(criteria: DeviceCriteria): Promise<Computer[]> {
    return this.repository.getComputers(criteria)
  }

  async registerFrequentComputer(request: ComputerRequest): Promise<FrequentComputer> {
    const device = await this.generateComputerFromRequest(request)

    const frequentComputer: FrequentComputer = {
      device,
      checkinURL: Helper.getFrequentCheckinURL(device.id, this.baseURL),
      checkoutURL: Helper.getFrequentCheckoutURL(device.id, this.baseURL)
    }

    await this.repository.registerFrequentComputer(frequentComputer)

    return frequentComputer
  }

  async checkinComputer(request: ComputerRequest): Promise<Computer> {
    const computer = await this.generateComputerFromRequest(request)

    computer.checkinAt = new Date()

    this.repository.checkinComputer(computer)

    return computer
  }

  async checkinFrequentComputer(id: DeviceId): Promise<FrequentComputer> {
    const isComputerRegistered = await this.repository.isFrequentComputerRegistered(id)

    if (!isComputerRegistered) {
      throw SERVICE_ERRORS.DeviceNotFound
    }

    return this.repository.checkinFrequentComputer(id, new Date())
  }

  private async generateComputerFromRequest(request: ComputerRequest): Promise<Computer> {
    COMPUTER_REQUEST_SCHEMA.parse(request)

    const deviceId = Helper.generateDeviceId()

    const photoURL = await this.photoRepository.savePhoto(request.photo, deviceId)

    return mapRequestToComputer(request, deviceId, photoURL)
  }
}
