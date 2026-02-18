"use client";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useEffect, useState, use } from "react";

type PageProps = {
  params: Promise<{ floorId: string }>;
};

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

export default function FloorDetailPage({ params }: PageProps) {
  const { floorId } = use(params);
  const [parkingData, setParkingData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const response = await fetch(`/api/parking-spots?floor_id=${floorId}`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data: ApiResponse = await response.json();
        
        if (isMounted) {
          setParkingData(data);
        }
      } catch (error) {
        console.error('Error fetching floor data:', error);
        if (isMounted) {
          setParkingData(null);
        }
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
  }, [floorId]);

  if (loading) {
    return (
      <div className="dashboard-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-stone-900 border-r-transparent"></div>
          <p className="mt-4 text-stone-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (!parkingData || parkingData.parking_spots.length === 0) {
    notFound();
  }

  const floor = parkingData.parking_spots[0];
  const total = parkingData.count;
  const available = parkingData.available_count;
  const occupied = parkingData.occupied_count;
  const availabilityRate = total === 0 ? 0 : Math.round((available / total) * 100);
  const occupancyRate = 100 - availabilityRate;

  const availableSlots = parkingData.parking_spots.filter(
    (spot) => spot.is_occupied === 0
  );
  const occupiedSlots = parkingData.parking_spots.filter(
    (spot) => spot.is_occupied === 1
  );

  return (
    <div className="dashboard-bg min-h-screen">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8">
        <header className="fade-up">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 transition hover:text-stone-900"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            กลับหน้าหลัก
          </Link>
          <div className="mt-6 space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Live now
            </div>
            <h1 className="text-4xl leading-tight text-stone-900 sm:text-5xl">
              {floor.floor_name}
            </h1>
            <p className="max-w-2xl text-base text-stone-600 sm:text-lg">
              MUICT Building · Main Campus
            </p>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 fade-up-delay">
          <div className="glass-panel rounded-3xl p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
              Insight
            </p>
            <h3 className="mt-3 text-xl text-stone-900">อัตราที่ว่าง</h3>
            <p className="mt-2 text-sm text-stone-500">
              {floor.floor_name}
            </p>
            <p className="mt-4 text-2xl font-semibold text-emerald-700">
              {availabilityRate}%
            </p>
          </div>
          <div className="glass-panel rounded-3xl p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
              Insight
            </p>
            <h3 className="mt-3 text-xl text-stone-900">อัตราการใช้งาน</h3>
            <p className="mt-2 text-sm text-stone-500">
              {floor.floor_name}
            </p>
            <p className="mt-4 text-2xl font-semibold text-stone-900">
              {occupancyRate}%
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <div className="glass-panel rounded-[32px] p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                  สรุปชั้นนี้
                </p>
                <h2 className="mt-2 text-2xl text-stone-900">
                  {floor.floor_name}
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  อัปเดตล่าสุด
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="rounded-2xl bg-white/80 px-4 py-3 text-sm font-semibold text-stone-700">
                  รวม {total} ช่อง
                </div>
                <div className="rounded-2xl bg-emerald-100 px-4 py-3 text-sm font-semibold text-emerald-700">
                  ว่าง {available} ช่อง
                </div>
                <div className="rounded-2xl bg-stone-100 px-4 py-3 text-sm font-semibold text-stone-700">
                  จอดแล้ว {occupied} คัน
                </div>
              </div>
            </div>

            <div className="mt-6 h-3 w-full rounded-full bg-stone-200">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${availabilityRate}%` }}
              />
            </div>
          </div>

          <div className="glass-panel rounded-[32px] p-6">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                สถานะช่องจอด
              </p>
              <h2 className="mt-2 text-2xl text-stone-900">
                ช่องจอดทั้งหมด {total} ช่อง
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                อัปเดตล่าสุด
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-emerald-700">
                    ช่องว่าง ({availableSlots.length})
                  </h3>
                  <span className="text-xs text-stone-500">
                    พร้อมใช้งานทันที
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {availableSlots.map((spot) => (
                    <div
                      key={spot.id}
                      className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-5 text-center transition hover:border-emerald-300 hover:bg-emerald-100"
                    >
                      <span className="text-xl font-bold text-emerald-700">
                        {spot.spot_number}
                      </span>
                      <span className="text-xs font-semibold text-emerald-600">
                        ว่าง
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {occupiedSlots.length > 0 && (
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-stone-700">
                      ช่องไม่ว่าง ({occupiedSlots.length})
                    </h3>
                    <span className="text-xs text-stone-500">
                      มีรถจอดอยู่
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {occupiedSlots.map((spot) => (
                      <div
                        key={spot.id}
                        className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-stone-100 px-4 py-5 text-center"
                      >
                        <span className="text-xl font-bold text-stone-600">
                          {spot.spot_number}
                        </span>
                        <span className="text-xs font-semibold text-stone-500">
                          ไม่ว่าง
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
