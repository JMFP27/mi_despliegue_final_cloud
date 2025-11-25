# Entities

User
  username
  password

Computer
  DeviceId
  brand
  model
  *color*
  photoURL
  owner
  updatedAt
  checkinAt
  checkoutAt

MedicalDevice
  *Serial*
  DeviceId
  brand
  model
  photoURL
  owner
  updatedAt
  checkinAt
  checkoutAt

FrequentComputer
  Computer
  CheckinURL
  CheckoutURL
    Automaticamente registra la entrada/salida del dispositivo en la fecha y hora actuales

EnteredDevice
  type
  DeviceId
  brand
  model
  photoURL
  owner
  updatedAt
  checkinAt
  checkoutAt

# Repository

DeviceRepository
  getMedicalDevices()
  getComputers()

  DeviceCriteria
    SortBy([]DeviceSortQuery)
    FilterBy([]DeviceFilterQuery)
    Limit
    Offset

  DeviceSortQuery
    Field
    Value
    IsAscending
 
  DeviceFilterQuery
    Field
    Value
  
DevicePhotoRepository
  savePhoto(binary, DeviceId)
  
# Services

DeviceService
  registerFrequentComputer

    Reciben datos distintos por lo tanto necesitan metodos separados
  checkinComputer()
  checkinMedicalDevice()

  checkoutDevice(DeviceId)
    - Verificar que el dispositivo aun no haya ingresado
    - Sirve de salida para dispositivos frecuentes y no frecuentes

  checkinFrequentComputer

  getFrequentComputers

  getEnteredDevices
    obtiene los dispositivos (tanto medicos como computadores) ingresados

  getMedicalDeviceRecords
  getComputerRecords

# Details

- Filtrar por dispositivo biomedico o computador
