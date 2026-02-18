"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";

type ParkingSpot = {
  id: number;
  floor_id: number;
  spot_number: string;
  is_occupied: number;
  camera_url: string | null;
  last_update: string;
  floor_name: string;
};

type ApiResponse = {
  status: string;
  count: number;
  available_count: number;
  occupied_count: number;
  parking_spots: ParkingSpot[];
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default function Home() {
  const [parkingData, setParkingData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const response = await fetch('/api/parking-spots');
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data: ApiResponse = await response.json();
        
        if (isMounted) {
          setParkingData(data);
        }
      } catch (error) {
        console.error('Error fetching parking data:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!parkingData) {
    return (
      <div className="dashboard-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-600">ไม่สามารถโหลดข้อมูลได้</p>
        </div>
      </div>
    );
  }

  // จัดกลุ่มข้อมูลตาม floor
  const floorGroups = parkingData.parking_spots.reduce((acc, spot) => {
    if (!acc[spot.floor_id]) {
      acc[spot.floor_id] = {
        floor_id: spot.floor_id,
        floor_name: spot.floor_name,
        spots: []
      };
    }
    acc[spot.floor_id].spots.push(spot);
    return acc;
  }, {} as Record<number, { floor_id: number; floor_name: string; spots: ParkingSpot[] }>);

  const floors = Object.values(floorGroups);
  
  const overview = {
    total: parkingData.count,
    available: parkingData.available_count,
    occupied: parkingData.occupied_count,
    floors: floors.length,
    buildings: 1 // ถ้ามีข้อมูล building ใน API ก็ปรับเพิ่ม
  };

  const occupancyRate =
    overview.total === 0
      ? 0
      : Math.round((overview.occupied / overview.total) * 100);

  const floorAvailability = (spots: ParkingSpot[]) => {
    const available = spots.filter(s => s.is_occupied === 0).length;
    return spots.length === 0 ? 0 : Math.round((available / spots.length) * 100);
  };

  const floorUsage = (spots: ParkingSpot[]) => {
    const occupied = spots.filter(s => s.is_occupied === 1).length;
    return spots.length === 0 ? 0 : Math.round((occupied / spots.length) * 100);
  };

  const mostAvailableFloor = floors.reduce((best, floor) => {
    if (!best) return floor;
    return floorAvailability(floor.spots) > floorAvailability(best.spots) ? floor : best;
  }, floors[0]);

  const busiestFloor = floors.reduce((best, floor) => {
    if (!best) return floor;
    return floorUsage(floor.spots) > floorUsage(best.spots) ? floor : best;
  }, floors[0]);

  return (
    <div className="dashboard-bg min-h-screen">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between fade-up">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Live now
            </div>
            <h1 className="text-4xl leading-tight text-stone-900 sm:text-5xl">
              ParkingLot Dashboard
            </h1>
            <p className="max-w-2xl text-base text-stone-600 sm:text-lg">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
          <div className="glass-panel flex flex-col gap-3 rounded-3xl px-6 py-5 text-sm text-stone-700">
            <div className="flex items-center justify-between gap-6">
              <span className="font-semibold text-stone-500">Date</span>
              <span className="font-semibold text-stone-900">Feb 16, 2026</span>
            </div>
            <div className="flex items-center justify-between gap-6">
              <span className="font-semibold text-stone-500">Last update</span>
              <span className="font-semibold text-stone-900">09:15</span>
            </div>
            <div className="flex items-center justify-between gap-6">
              <span className="font-semibold text-stone-500">Status</span>
              <span className="font-semibold text-emerald-700">Stable</span>
            </div>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 fade-up-delay">
          <div className="glass-panel rounded-3xl p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
              Total slots
            </p>
            <p className="mt-4 text-3xl font-semibold text-stone-900">
              {overview.total}
            </p>
            <p className="mt-2 text-sm text-stone-500">
              ครอบคลุม {overview.buildings} ตึก, {overview.floors} ชั้น
            </p>
          </div>
          <div className="glass-panel rounded-3xl p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
              Available
            </p>
            <p className="mt-4 text-3xl font-semibold text-emerald-700">
              {overview.available}
            </p>
            <p className="mt-2 text-sm text-stone-500">พร้อมใช้งานทันที</p>
          </div>
          <div className="glass-panel rounded-3xl p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
              Occupied
            </p>
            <p className="mt-4 text-3xl font-semibold text-stone-900">
              {overview.occupied}
            </p>
            <p className="mt-2 text-sm text-stone-500">อัปเดตจากเซนเซอร์</p>
          </div>
          <div className="glass-panel rounded-3xl p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
              Occupancy rate
            </p>
            <p className="mt-4 text-3xl font-semibold text-stone-900">
              {occupancyRate}%
            </p>
            <div className="mt-3 h-2 w-full rounded-full bg-stone-200">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${occupancyRate}%` }}
              />
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="glass-panel rounded-3xl p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
              Insight
            </p>
            <h3 className="mt-3 text-xl text-stone-900">ชั้นที่ว่างที่สุด</h3>
            <p className="mt-2 text-sm text-stone-500">
              {mostAvailableFloor?.floor_name}
            </p>
            <p className="mt-4 text-2xl font-semibold text-emerald-700">
              {mostAvailableFloor ? floorAvailability(mostAvailableFloor.spots) : 0}%
            </p>
          </div>
          <div className="glass-panel rounded-3xl p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
              Insight
            </p>
            <h3 className="mt-3 text-xl text-stone-900">ชั้นที่แน่นที่สุด</h3>
            <p className="mt-2 text-sm text-stone-500">
              {busiestFloor?.floor_name}
            </p>
            <p className="mt-4 text-2xl font-semibold text-stone-900">
              {busiestFloor ? floorUsage(busiestFloor.spots) : 0}%
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <div className="glass-panel rounded-[32px] p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                  Building
                </p>
                <h2 className="mt-2 text-2xl text-stone-900">
                  MUICT Building
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  Main Campus
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="rounded-2xl bg-white/80 px-4 py-3 text-sm font-semibold text-stone-700">
                  รวม {overview.total} ช่อง
                </div>
                <div className="rounded-2xl bg-emerald-100 px-4 py-3 text-sm font-semibold text-emerald-700">
                  ว่าง {overview.available} ช่อง
                </div>
                <div className="rounded-2xl bg-stone-100 px-4 py-3 text-sm font-semibold text-stone-700">
                  ว่าง {Math.round((overview.available / overview.total) * 100)}%
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {floors.map((floor) => {
                const available = floor.spots.filter(s => s.is_occupied === 0).length;
                const occupied = floor.spots.filter(s => s.is_occupied === 1).length;
                const total = floor.spots.length;
                const availabilityRate = total === 0 ? 0 : Math.round((available / total) * 100);

                return (
                  <div
                    key={floor.floor_id}
                    className="rounded-3xl border border-stone-200/80 bg-white/90 p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-stone-500">
                          {floor.floor_name}
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-stone-900">
                          {available}
                          <span className="text-sm font-medium text-stone-500">
                            /{total}
                          </span>
                        </p>
                        <p className="mt-1 text-xs text-stone-400">
                          อัปเดตล่าสุด
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        ว่าง {availabilityRate}%
                      </span>
                    </div>

                    <div className="mt-4 h-2 w-full rounded-full bg-stone-200">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${availabilityRate}%` }}
                      />
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-stone-500">
                      <span>จอดแล้ว {occupied} คัน</span>
                      <span>เหลือ {available} ช่อง</span>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex gap-2">
                        {floor.spots.slice(0, 5).map((spot) => (
                          <span
                            key={spot.id}
                            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                              spot.is_occupied === 0
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-stone-100 text-stone-500"
                            }`}
                          >
                            {spot.spot_number}
                          </span>
                        ))}
                      </div>
                      <Link
                        href={`/floor/${floor.floor_id}`}
                        className="rounded-full bg-stone-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-stone-800"
                      >
                        ดูช่องจอด
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
