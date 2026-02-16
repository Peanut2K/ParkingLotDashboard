export type SlotStatus = "available" | "occupied";

export type Slot = {
  id: string;
  status: SlotStatus;
};

export type Floor = {
  id: string;
  name: string;
  total: number;
  available: number;
  updatedAt: string;
  slots: Slot[];
};

export type Building = {
  id: string;
  name: string;
  location: string;
  floors: Floor[];
};

export type ParkingApiResponse = {
  buildings: Building[];
  fetchedAt: string;
};

export type FloorWithBuilding = Floor & {
  buildingId: string;
  buildingName: string;
  buildingLocation: string;
};

export const mockParkingData: ParkingApiResponse = {
  buildings: [
    {
      id: "bkk-central",
      name: "อาคาร A - Central Lot",
      location: "Bangkok Campus",
      floors: [
        {
          id: "bkk-central-l1",
          name: "ชั้น L1",
          total: 5,
          available: 3,
          updatedAt: "09:15",
          slots: [
            { id: "A1", status: "available" },
            { id: "A2", status: "occupied" },
            { id: "A3", status: "available" },
            { id: "A4", status: "occupied" },
            { id: "A5", status: "available" },
          ],
        },
      ],
    },
  ],
  fetchedAt: "2026-02-16T09:15:00+07:00",
};

export const getOverview = (data: ParkingApiResponse) => {
  return data.buildings.reduce(
    (acc, building) => {
      const totals = building.floors.reduce(
        (floorAcc, floor) => {
          floorAcc.total += floor.total;
          floorAcc.available += floor.available;
          return floorAcc;
        },
        { total: 0, available: 0 }
      );
      acc.total += totals.total;
      acc.available += totals.available;
      acc.floors += building.floors.length;
      acc.buildings += 1;
      return acc;
    },
    { total: 0, available: 0, floors: 0, buildings: 0 }
  );
};

export const getFloors = (data: ParkingApiResponse): FloorWithBuilding[] => {
  return data.buildings.flatMap((building) =>
    building.floors.map((floor) => ({
      ...floor,
      buildingId: building.id,
      buildingName: building.name,
      buildingLocation: building.location,
    }))
  );
};

export const findFloorById = (
  data: ParkingApiResponse,
  floorId: string
): FloorWithBuilding | null => {
  const floors = getFloors(data);
  return floors.find((floor) => floor.id === floorId) ?? null;
};
