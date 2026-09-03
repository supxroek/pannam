import { useState, useMemo } from "react";
import { villages, zones, existingHouses } from "../../constants/registerData";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Search,
  Home,
  Plus,
  Check,
  Hash,
  X,
  Info,
  RotateCcw,
} from "lucide-react";

export default function Step3AddressInfo({ data, onChange, errors }) {
  // โหมดการเลือกบ้าน: 'search' (ค้นหาในระบบ) หรือ 'create' (เพิ่มบ้านใหม่)
  const [mode, setMode] = useState(data.isNewHouse ? "create" : "search");
  const [searchQuery, setSearchQuery] = useState("");

  const selectedVillageName = villages.find((v) => v.id === data.village)?.name;
  const selectedZoneName =
    data.zone !== undefined && data.zone !== "" && data.zone !== null
      ? zones[data.zone]
      : undefined;

  // กรองบ้านเลขที่ในระบบเฉพาะของหมู่บ้านที่เลือก
  const housesInSelectedVillage = useMemo(() => {
    if (!data.village) return [];
    return existingHouses.filter((h) => h.villageId === data.village);
  }, [data.village]);

  // ผลลัพธ์การค้นหาบ้านเลขที่
  const filteredHouses = useMemo(() => {
    if (!searchQuery.trim()) return housesInSelectedVillage;
    const q = searchQuery.trim().toLowerCase();
    return housesInSelectedVillage.filter((h) =>
      h.houseNumber.toLowerCase().includes(q),
    );
  }, [housesInSelectedVillage, searchQuery]);

  // เมื่อเปลี่ยนหมู่บ้าน เคลียร์ค่าบ้านเดิมถ้าไม่ได้อยู่ในหมู่บ้านนี้
  const handleVillageChange = (v) => {
    const villageId = parseInt(v);
    onChange("village", villageId);
    // เคลียร์บ้านเลขที่เมื่อสลับหมู่บ้าน
    onChange("houseNumber", "");
    onChange("zone", undefined);
    onChange("isNewHouse", false);
    setSearchQuery("");
  };

  // เมื่อเลือกบ้านที่มีอยู่ในระบบ
  const handleSelectExistingHouse = (house) => {
    onChange("houseNumber", house.houseNumber);
    onChange("zone", house.zone);
    onChange("isNewHouse", false);
  };

  // ยกเลิกการเลือกบ้านเพื่อค้นหาใหม่
  const handleClearSelectedHouse = () => {
    onChange("houseNumber", "");
    onChange("zone", undefined);
    onChange("isNewHouse", false);
  };

  // สลับไปโหมดเพิ่มบ้านใหม่ พร้อมใส่ค่าที่ค้นหาไว้ (ถ้ามี)
  const handleSwitchToCreate = (initialHouseNumber = "") => {
    setMode("create");
    onChange("isNewHouse", true);
    if (initialHouseNumber) {
      onChange("houseNumber", initialHouseNumber);
    }
  };

  // สลับกลับมาโหมดค้นหา
  const handleSwitchToSearch = () => {
    setMode("search");
    onChange("isNewHouse", false);
  };

  const isHouseSelected = Boolean(data.houseNumber && !data.isNewHouse);

  return (
    <div className="animate-slide-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">ข้อมูลที่อยู่</h2>
        <p className="text-muted-foreground text-sm">
          เลือกหมู่บ้านและระบุบ้านเลขที่ของคุณ
        </p>
      </div>

      <FieldGroup>
        {/* 1. เลือกหมู่บ้าน */}
        <Field data-invalid={!!errors.village || undefined}>
          <FieldLabel>
            หมู่บ้าน <span className="text-destructive">*</span>
          </FieldLabel>
          <Select
            value={data.village ? String(data.village) : undefined}
            onValueChange={handleVillageChange}
          >
            <SelectTrigger
              className="w-full h-11! text-base"
              aria-invalid={!!errors.village || undefined}
            >
              <SelectValue placeholder="-- เลือกหมู่บ้านของคุณ --">
                {selectedVillageName}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {villages.map((v) => (
                  <SelectItem
                    key={v.id}
                    value={String(v.id)}
                    className="px-3 py-2.5 text-sm"
                  >
                    {v.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {errors.village ? (
            <FieldDescription className="text-destructive">
              {errors.village}
            </FieldDescription>
          ) : (
            <FieldDescription>เลือกหมู่บ้านที่คุณอาศัยอยู่</FieldDescription>
          )}
        </Field>

        {/* 2. ข้อมูลบ้านเลขที่ (ค้นหาในระบบ / เพิ่มใหม่) */}
        {!data.village ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-5 text-center">
            <Home className="mx-auto size-8 text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-600">
              กรุณาเลือกหมู่บ้านก่อนค้นหาบ้านเลขที่
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              ระบบจะแสดงข้อมูลบ้านเลขที่ที่มีอยู่ในหมู่บ้านนั้นๆ
            </p>
          </div>
        ) : (
          <Field data-invalid={!!errors.houseNumber || undefined}>
            <div className="flex items-center justify-between mb-1.5">
              <FieldLabel className="mb-0!">
                บ้านเลขที่ <span className="text-destructive">*</span>
              </FieldLabel>

              {/* Mode Switcher Tabs */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/70">
                <button
                  type="button"
                  onClick={handleSwitchToSearch}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                    mode === "search"
                      ? "bg-white text-blue-600 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Search className="size-3" />
                  <span>ค้นหาในระบบ</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchToCreate(searchQuery || data.houseNumber)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                    mode === "create"
                      ? "bg-white text-blue-600 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Plus className="size-3" />
                  <span>เพิ่มบ้านใหม่</span>
                </button>
              </div>
            </div>

            {/* ========== MODE 1: ค้นหาในระบบ ========== */}
            {mode === "search" && (
              <div className="space-y-3">
                {/* หากเลือกบ้านแล้ว แสดงการ์ดผลลัพธ์ */}
                {isHouseSelected ? (
                  <div className="relative overflow-hidden rounded-xl border-2 border-emerald-400/80 bg-emerald-50/50 p-4 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="size-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <Home className="size-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-800 text-base">
                              บ้านเลขที่ {data.houseNumber}
                            </h4>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                              <Check className="size-3" /> มีในระบบ
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            {selectedVillageName}
                            {selectedZoneName && (
                              <span className="ml-1.5 font-medium text-slate-700">
                                • โซน {selectedZoneName}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleClearSelectedHouse}
                        className="text-xs text-slate-500 hover:text-slate-800 h-8 px-2 cursor-pointer"
                      >
                        <RotateCcw className="size-3 mr-1" />
                        เปลี่ยน
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* ช่องค้นหาบ้านเลขที่ */
                  <div className="space-y-2">
                    <InputGroup className="h-11">
                      <InputGroupAddon align="inline-start">
                        <Search className="size-4 text-slate-400" />
                      </InputGroupAddon>
                      <InputGroupInput
                        placeholder="พิมพ์ค้นหาบ้านเลขที่ เช่น 12, 15/3..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="text-base"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          className="mr-2 text-slate-400 hover:text-slate-600 p-1"
                        >
                          <X className="size-4" />
                        </button>
                      )}
                    </InputGroup>

                    {/* รายการผลลัพธ์บ้านในระบบ */}
                    {filteredHouses.length > 0 ? (
                      <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-xs max-h-56 overflow-y-auto space-y-1">
                        <div className="px-2 py-1 text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center justify-between">
                          <span>บ้านเลขที่ในระบบ ({filteredHouses.length})</span>
                          <span className="text-slate-400 text-[10px]">แตะเพื่อเลือก</span>
                        </div>

                        {filteredHouses.map((house) => (
                          <button
                            key={house.id}
                            type="button"
                            onClick={() => handleSelectExistingHouse(house)}
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors hover:bg-blue-50/80 active:bg-blue-100 group cursor-pointer border border-transparent hover:border-blue-200"
                          >
                            <div className="flex items-center gap-2.5">
                              <Home className="size-4 text-slate-400 group-hover:text-blue-600" />
                              <span className="font-semibold text-slate-800 group-hover:text-blue-700">
                                {house.houseNumber}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {house.zone !== undefined && (
                                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md group-hover:bg-blue-100/70 group-hover:text-blue-700">
                                  โซน {zones[house.zone]}
                                </span>
                              )}
                              <Check className="size-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      /* ไม่พบบ้านเลขที่ที่ค้นหา */
                      <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50/60 p-4 text-center">
                        <p className="text-xs text-amber-800 font-medium mb-1">
                          ไม่พบบ้านเลขที่ &ldquo;{searchQuery}&rdquo; ในระบบของ {selectedVillageName}
                        </p>
                        <p className="text-[11px] text-amber-600 mb-3">
                          หากยังไม่มีบ้านเลขที่นี้ในระบบ สามารถเพิ่มเข้าระบบใหม่ได้ทันทีค่ะ
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleSwitchToCreate(searchQuery)}
                          className="bg-white border-amber-300 text-amber-900 hover:bg-amber-100/80 text-xs font-medium cursor-pointer shadow-xs"
                        >
                          <Plus className="size-3.5 mr-1 text-amber-600" />
                          เพิ่มบ้านเลขที่ &ldquo;{searchQuery}&rdquo; เป็นบ้านใหม่
                        </Button>
                      </div>
                    )}

                    {/* ปุ่มลัดเพิ่มบ้านใหม่กรณีหาไม่เจอ */}
                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={() => handleSwitchToCreate(searchQuery)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 cursor-pointer hover:underline"
                      >
                        <Plus className="size-3" />
                        ไม่พบบ้านเลขที่ของคุณในรายการ? แตะเพื่อเพิ่มบ้านใหม่
                      </button>
                    </div>
                  </div>
                )}

                {errors.houseNumber && (
                  <FieldDescription className="text-destructive">
                    {errors.houseNumber}
                  </FieldDescription>
                )}
              </div>
            )}

            {/* ========== MODE 2: เพิ่มบ้านใหม่ด้วยตนเอง ========== */}
            {mode === "create" && (
              <div className="space-y-4 rounded-xl border border-blue-100 bg-blue-50/40 p-4">
                <div className="flex items-start gap-2.5 text-xs text-blue-800 bg-blue-100/70 p-2.5 rounded-lg">
                  <Info className="size-4 shrink-0 text-blue-600 mt-0.5" />
                  <div>
                    <span className="font-semibold">โหมดเพิ่มบ้านใหม่:</span> กรอกบ้านเลขที่ของคุณเพื่อเพิ่มเข้าสู่ระบบ PANNAM
                  </div>
                </div>

                {/* ช่องกรอกบ้านเลขที่ */}
                <Field data-invalid={!!errors.houseNumber || undefined}>
                  <FieldLabel htmlFor="houseNumber" className="text-xs font-semibold">
                    บ้านเลขที่ที่ต้องการเพิ่ม <span className="text-destructive">*</span>
                  </FieldLabel>
                  <InputGroup className="h-11 bg-white">
                    <InputGroupAddon align="inline-start">
                      <Hash className="size-4 text-muted-foreground" />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="houseNumber"
                      placeholder="เช่น 123/4, 56 หรือ 789"
                      value={data.houseNumber || ""}
                      onChange={(e) => {
                        onChange("houseNumber", e.target.value);
                        onChange("isNewHouse", true);
                      }}
                      maxLength={20}
                      className="text-base"
                      aria-invalid={!!errors.houseNumber || undefined}
                    />
                  </InputGroup>
                  {errors.houseNumber ? (
                    <FieldDescription className="text-destructive">
                      {errors.houseNumber}
                    </FieldDescription>
                  ) : (
                    <FieldDescription>ระบุบ้านเลขที่ให้ชัดเจน</FieldDescription>
                  )}
                </Field>

                {/* ช่องเลือกโซน */}
                <Field data-invalid={!!errors.zone || undefined}>
                  <FieldLabel className="text-xs font-semibold">
                    โซน (ไม่จำเป็นต้องระบุ)
                  </FieldLabel>
                  <Select
                    value={
                      data.zone !== undefined && data.zone !== "" && data.zone !== null
                        ? String(data.zone)
                        : undefined
                    }
                    onValueChange={(v) =>
                      onChange("zone", v !== "" ? parseInt(v) : undefined)
                    }
                  >
                    <SelectTrigger
                      className="w-full h-11! bg-white text-base"
                      aria-invalid={!!errors.zone || undefined}
                    >
                      <SelectValue placeholder="เลือกโซน (ระบุหรือไม่ระบุก็ได้)">
                        {data.zone !== undefined &&
                        data.zone !== null &&
                        data.zone !== ""
                          ? selectedZoneName
                          : "ไม่ได้เลือก"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem
                          value=""
                          className="px-2.5 py-2.5 text-muted-foreground"
                        >
                          -- ไม่ระบุโซน --
                        </SelectItem>
                        {zones.map((z, i) => (
                          <SelectItem
                            key={i}
                            value={String(i)}
                            className="px-2.5 py-2.5"
                          >
                            โซน {z}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.zone && (
                    <FieldDescription className="text-destructive">
                      {errors.zone}
                    </FieldDescription>
                  )}
                </Field>

                {/* ปุ่มสลับกลับไปค้นหา */}
                <div className="pt-1 text-center">
                  <button
                    type="button"
                    onClick={handleSwitchToSearch}
                    className="text-xs text-slate-500 hover:text-slate-800 font-medium inline-flex items-center gap-1 cursor-pointer hover:underline"
                  >
                    <Search className="size-3" />
                    ต้องการค้นหาจากบ้านที่มีในระบบแทน? คลิกที่นี่
                  </button>
                </div>
              </div>
            )}
          </Field>
        )}
      </FieldGroup>
    </div>
  );
}
