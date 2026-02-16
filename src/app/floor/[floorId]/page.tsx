import Link from "next/link";
import { notFound } from "next/navigation";
import { findFloorById, mockParkingData } from "@/data/parking-data";

type PageProps = {
  params: Promise<{ floorId: string }>;
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default async function FloorDetailPage({ params }: PageProps) {
  
  const { floorId } = await params;
  const floor = findFloorById(mockParkingData, floorId);

  if (!floor) {
    notFound();
  }

  const occupied = floor.total - floor.available;
  const availabilityRate =
    floor.total === 0 ? 0 : Math.round((floor.available / floor.total) * 100);
  const occupancyRate = 100 - availabilityRate;

  const availableSlots = floor.slots.filter(
    (slot) => slot.status === "available"
  );
  const occupiedSlots = floor.slots.filter(
    (slot) => slot.status === "occupied"
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
              {floor.name}
            </h1>
            <p className="max-w-2xl text-base text-stone-600 sm:text-lg">
              {floor.buildingName} · {floor.buildingLocation}
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
              {floor.name} ({floor.buildingName})
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
              {floor.name} ({floor.buildingName})
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
                  {floor.name} - {floor.buildingName}
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  อัปเดตล่าสุด {floor.updatedAt} น.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="rounded-2xl bg-white/80 px-4 py-3 text-sm font-semibold text-stone-700">
                  รวม {floor.total} ช่อง
                </div>
                <div className="rounded-2xl bg-emerald-100 px-4 py-3 text-sm font-semibold text-emerald-700">
                  ว่าง {floor.available} ช่อง
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
                ช่องจอดทั้งหมด {floor.slots.length} ช่อง
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                ต่อจาก API: {mockParkingData.fetchedAt}
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
                  {availableSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-5 text-center transition hover:border-emerald-300 hover:bg-emerald-100"
                    >
                      <span className="text-xl font-bold text-emerald-700">
                        {slot.id}
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
                    {occupiedSlots.map((slot) => (
                      <div
                        key={slot.id}
                        className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-stone-100 px-4 py-5 text-center"
                      >
                        <span className="text-xl font-bold text-stone-600">
                          {slot.id}
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
