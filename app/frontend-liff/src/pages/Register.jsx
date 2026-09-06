import { useState, useCallback, useEffect, useRef } from 'react';
import StepIndicator from '@/components/ui/StepIndicator';
import WelcomeScreen from '@/components/register/WelcomeScreen';
import Step1PersonalInfo from '@/components/register/Step1PersonalInfo';
import Step2ContactInfo from '@/components/register/Step2ContactInfo';
import Step3AddressInfo from '@/components/register/Step3AddressInfo';
import Step4Review from '@/components/register/Step4Review';
import SuccessScreen from '@/components/register/SuccessScreen';
import LiffLoadingScreen from '@/components/register/LiffLoadingScreen';
import LiffErrorScreen from '@/components/register/LiffErrorScreen';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import liff from '@line/liff';
import { useLiffAuth } from '@/hooks/useLiffAuth';
import { LINE_LIFF_ID_REGISTER } from '@/constants/line-liff';
import { registerMember, fetchVillages } from '@/services/api';
import { parseApiError } from '@/utils/api-error';
import { toast } from '@/components/ui/toast';
import { validateFormStep } from '@/schemas/register.schema';
import { forceReLogin } from '@/lib/liff';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// สำหรับทดสอบ useLiffAuth เพื่อไม่ให้หน้าเว็บทำการ Login จริง
import { TEST_useLiffAuth } from '@/constants/registerData';

const TOTAL_FORM_STEPS = 4;
const DRAFT_STORAGE_KEY = 'pan_nam_registration_draft';

export default function Register() {
  // =========================================================================
  // การตั้งค่า LIFF Auth:
  // สำหรับการใช้งานจริง (Production/Staging): ปลดคอมเมนต์ useLiffAuth ด้านล่างนี้
  const { user, loading, error } = useLiffAuth(LINE_LIFF_ID_REGISTER);
  //
  // สำหรับการพัฒนาใน Local (Mock LIFF):
  // =========================================================================
  // const { users: user, loading, error } = TEST_useLiffAuth();

  const [step, setStep] = useState(0);

  // ข้อมูลหมู่บ้านที่ดึงมาจาก API Backend
  const [villages, setVillages] = useState([]);
  const [loadingVillages, setLoadingVillages] = useState(false);

  // กู้คืนข้อมูลฟอร์มจาก sessionStorage (ถ้ามีร่างที่เคยกรอกไว้)
  const [formData, setFormData] = useState(() => {
    try {
      const savedDraft = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        return JSON.parse(savedDraft);
      }
    } catch (e) {
      console.warn('ไม่สามารถโหลด draft จาก sessionStorage ได้:', e);
    }
    return {
      firstName: '',
      lastName: '',
      birthDay: '',
      birthMonth: '',
      birthYear: '',
      idCard: '',
      phone: '',
      village: '',
      houseNumber: '',
      zone: '',
    };
  });

  const [errors, setErrors] = useState({});
  const [loadingState, setLoadingState] = useState(false);

  // ควบคุมการแสดงผล Modal กรณี Session หมดอายุ หรือ User ซ้ำ
  const [sessionExpiredOpen, setSessionExpiredOpen] = useState(false);
  const [userExistsOpen, setUserExistsOpen] = useState(false);

  // ควบคุมการทำงานของ preloadVillages ให้ทำเพียงครั้งเดียว (ป้องกัน Infinite Loop จากการ re-render)
  const hasFetchedVillagesRef = useRef(false);

  // Preload ข้อมูลหมู่บ้านล่วงหน้าเมื่อผู้ใช้เข้าสู่ระบบ
  useEffect(() => {
    // หากเคยเรียกแล้ว หรือกำลังเรียกอยู่ ให้ข้ามทันที
    if (hasFetchedVillagesRef.current) return;
    hasFetchedVillagesRef.current = true;

    let isMounted = true;
    const idToken = user?.idToken || liff.getIDToken();

    async function preloadVillages() {
      // 1. หากไม่มี idToken ให้บันทึก error log, แจ้งเตือนผู้ใช้ทันที และหยุดทำงาน
      if (!idToken) {
        console.error('ไม่พบ LINE ID Token สำหรับดึงข้อมูลหมู่บ้าน');
        setSessionExpiredOpen(true);
        if (isMounted) {
          toast.add({
            title: 'ไม่พบข้อมูลการเข้าสู่ระบบ',
            description: 'ไม่พบ LINE ID Token กรุณาเข้าสู่ระบบใหม่อีกครั้ง',
            type: 'error',
          });
        }
        return;
      }

      try {
        setLoadingVillages(true);
        const list = await fetchVillages(idToken);
        if (isMounted && list && list.length > 0) {
          setVillages(list);
        }
      } catch (err) {
        // 2. บันทึก log ความล้มเหลวด้วย console.error เพื่อตรวจสอบตอนเกิดบั๊ก
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลหมู่บ้านจากเซิร์ฟเวอร์:', err);

        // แสดงการแจ้งเตือนทันทีว่าเกิดข้อผิดพลาด
        if (isMounted) {
          const apiError = parseApiError(err);
          if (apiError.isTokenExpired || apiError.isTokenInvalid) {
            setSessionExpiredOpen(true);
          } else {
            toast.add({
              title: 'โหลดข้อมูลหมู่บ้านไม่สำเร็จ',
              description:
                apiError.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์',
              type: 'error',
            });
          }
        }
      } finally {
        // 3. สั่งปิดสถานะ Loading ในบล็อก finally อย่างปลอดภัยเพื่อป้องกัน Memory Leak
        if (isMounted) {
          setLoadingVillages(false);
        }
      }
    }

    preloadVillages();

    return () => {
      isMounted = false;
    };
  }, [user?.idToken]);

  // อัปเดตข้อมูลฟอร์มและบันทึกลง sessionStorage เสมอ
  const handleChange = useCallback((field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      try {
        sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        // ignore storage quota errors
        console.warn('เกิดข้อผิดพลาดในการบันทึกข้อมูล:', error);
      }
      return updated;
    });

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  // ไปยังขั้นตอนถัดไป โดยตรวจสอบข้อมูลด้วย Zod
  const handleNext = () => {
    const { isValid, errors: validationErrors } = validateFormStep(step - 1, formData);
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep((prev) => prev - 1);
  };

  const handleGoToStep = (targetStep) => {
    setStep(targetStep + 1);
  };

  // ส่งข้อมูลสมัครสมาชิกไปยัง Backend พร้อมจัดการ Error Responses ด้วย ApiError
  const handleSubmit = async () => {
    // 1. Final Validation ด้วย Zod ทุกขั้นตอน
    const { isValid, errors: fullErrors } = validateFormStep(99, formData);
    if (!isValid) {
      setErrors(fullErrors);
      // พาไปยังขั้นตอนที่มีฟิลด์ผิดพลาดแรก
      if (fullErrors.firstName || fullErrors.lastName || fullErrors.birthDay || fullErrors.birthMonth || fullErrors.birthYear) {
        setStep(1);
      } else if (fullErrors.idCard || fullErrors.phone) {
        setStep(2);
      } else if (fullErrors.village || fullErrors.houseNumber) {
        setStep(3);
      }
      toast.add({
        title: 'ข้อมูลไม่ครบถ้วน',
        description: 'กรุณากรอกข้อมูลให้ถูกต้องและครบถ้วนตามขั้นตอน',
        type: 'error',
      });
      return;
    }

    try {
      setLoadingState(true);

      // ดึง token ล่าสุดจาก liff หรือ user state
      const idToken = user?.idToken || liff.getIDToken();

      if (!idToken) {
        const tokenErr = new Error('ไม่พบข้อมูลการเข้าสู่ระบบ LINE กรุณาลองใหม่อีกครั้ง');
        tokenErr.code = 'TOKEN_INVALID';
        throw tokenErr;
      }

      await registerMember(formData, idToken, villages);

      // สำเร็จ: ล้าง draft ออกจาก sessionStorage และไปหน้าขอบคุณ
      try {
        sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch (error) {
        // ignore
        console.warn('เกิดข้อผิดพลาดในการล้างข้อมูล draft:', error);
      }
      setStep(5);
    } catch (err) {
      console.error('Registration failed:', err);

      const apiError = parseApiError(err);

      // 1. กรณี Token หมดอายุ หรือไม่ถูกต้อง: บันทึก draft และแจ้งเตือนผู้ใช้เพื่อ Login ใหม่
      if (apiError.isTokenExpired || apiError.isTokenInvalid) {
        try {
          sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
        } catch (error) {
          console.warn('เกิดข้อผิดพลาดในการบันทึกข้อมูล draft:', error);
        }
        setSessionExpiredOpen(true);
        return;
      }

      // 2. กรณี LINE userId ซ้ำในระบบ: แสดง Modal แจ้งเตือนว่ามีบัญชีแล้ว
      if (apiError.isUserExists) {
        setUserExistsOpen(true);
        return;
      }

      // 3. กรณีเลขบัตร ปชช. ซ้ำในระบบ: เด้งกลับไป Step 2 พร้อมไฮไลต์แจ้งเตือนใต้ช่อง idCard
      if (apiError.isIdCardExists) {
        setStep(2);
        setErrors((prev) => ({
          ...prev,
          idCard: 'เลขประจำตัวประชาชนนี้ถูกลงทะเบียนในระบบแล้ว',
        }));
        toast.add({
          title: 'เลขบัตรประชาชนซ้ำในระบบ',
          description: 'เลขประจำตัวประชาชนนี้ได้ลงทะเบียนแล้ว กรุณาตรวจสอบอีกครั้ง',
          type: 'error',
        });
        return;
      }

      // 4. กรณี Validation Error จาก Backend
      if (apiError.isValidationError && apiError.errors) {
        setErrors(apiError.errors);
        if (apiError.errors.firstName || apiError.errors.lastName || apiError.errors.birthDay || apiError.errors.birthMonth || apiError.errors.birthYear) {
          setStep(1);
        } else if (apiError.errors.idCard || apiError.errors.phone) {
          setStep(2);
        } else if (apiError.errors.village || apiError.errors.houseNumber) {
          setStep(3);
        }
        toast.add({
          title: 'ข้อมูลไม่ถูกต้อง',
          description: apiError.message || 'กรุณาตรวจสอบข้อมูลที่กรอกอีกครั้ง',
          type: 'error',
        });
        return;
      }

      // ข้อผิดพลาดทั่วไปอื่นๆ
      toast.add({
        title: 'การลงทะเบียนไม่สำเร็จ',
        description: apiError.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล โปรดลองใหม่อีกครั้ง',
        type: 'error',
      });
    } finally {
      setLoadingState(false);
    }
  };

  // จัดการการ Login ใหม่เมื่อ Token หมดอายุ
  const handleReLogin = () => {
    setSessionExpiredOpen(false);
    try {
      forceReLogin();
    } catch (error) {
      console.warn('เกิดข้อผิดพลาดในการ Login ใหม่:', error);
      window.location.reload();
    }
  };

  // จัดการการปิดหน้าต่างเมื่อ User มีบัญชีอยู่แล้ว
  const handleCloseLiff = () => {
    setUserExistsOpen(false);
    try {
      if (liff.isInClient()) {
        liff.closeWindow();
      } else {
        setStep(0);
      }
    } catch (error) {
      console.warn('เกิดข้อผิดพลาดในการปิดหน้าต่าง:', error);
      setStep(0);
    }
  };

  // 1. สถานะกำลังโหลด: ขณะกำลังเริ่มต้น หรือขณะกำลังจะ redirect ไปหน้า Login LINE
  if (loading) {
    return <LiffLoadingScreen loading={loading} />;
  }

  // 2. สถานะเกิดข้อผิดพลาด: เชื่อมต่อ LINE LIFF ไม่สำเร็จ
  if (error) {
    return <LiffErrorScreen error={error} />;
  }

  // 3. Step 0: Welcome Screen
  if (step === 0) {
    return <WelcomeScreen onStart={() => setStep(1)} user={user} />;
  }

  // 4. Step 5: Success Screen
  if (step === 5) {
    return <SuccessScreen data={formData} user={user} />;
  }

  // 5. Steps 1-4: Form Steps
  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col">
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full bg-white min-h-screen shadow-xl">
        {/* Sticky Header */}
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm px-5 pt-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <StepIndicator
                currentStep={step - 1}
                totalSteps={TOTAL_FORM_STEPS}
              />

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-3">
                  {step > 0 && (
                    <Button
                      onClick={handleBack}
                      variant="secondary"
                      className="w-10 h-9 cursor-pointer"
                    >
                      <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
                    </Button>
                  )}
                  <p className="text-sm text-slate-500 font-medium">
                    ขั้นตอนที่ {step} จาก {TOTAL_FORM_STEPS}
                  </p>
                </div>

                {/* User Mini Badge */}
                {user && (
                  <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-full border border-slate-200/60 max-w-32.5">
                    {user.pictureUrl ? (
                      <img
                        src={user.pictureUrl}
                        alt=""
                        className="size-5 rounded-full object-cover border border-emerald-500 shrink-0"
                      />
                    ) : (
                      <span className="size-2 rounded-full bg-emerald-500 shrink-0"></span>
                    )}
                    <span className="text-[11px] font-medium text-slate-600 truncate">
                      {user.displayName}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 px-5 py-4 overflow-y-auto">
          <div className="animate-slide-in">
            {step === 1 && (
              <Step1PersonalInfo
                data={formData}
                onChange={handleChange}
                errors={errors}
              />
            )}
            {step === 2 && (
              <Step2ContactInfo
                data={formData}
                onChange={handleChange}
                errors={errors}
              />
            )}
            {step === 3 && (
              <Step3AddressInfo
                data={formData}
                onChange={handleChange}
                errors={errors}
                villages={villages}
                loadingVillages={loadingVillages}
                idToken={user?.idToken || liff.getIDToken()}
              />
            )}
            {step === 4 && (
              <Step4Review
                data={formData}
                onBack={handleGoToStep}
                onSubmit={handleSubmit}
                loading={loadingState}
              />
            )}
          </div>
        </div>

        {/* Sticky Bottom Button (Steps 1-3 only) */}
        {step < 4 && (
          <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-slate-100 px-5 py-4">
            <Button
              onClick={handleNext}
              className="w-full text-white font-semibold py-6 rounded-2xl shadow-lg hover:scale-98 hover:ring-2 hover:ring-blue-900 text-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>ถัดไป</span>
              <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
            </Button>
          </div>
        )}
      </div>

      {/* Modal: แจ้งเตือน Token หมดอายุ */}
      <AlertDialog open={sessionExpiredOpen} onOpenChange={setSessionExpiredOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>เซสชันการเข้าสู่ระบบหมดอายุ</AlertDialogTitle>
            <AlertDialogDescription>
              เซสชัน LINE ID Token ของคุณหมดอายุแล้ว เพื่อความปลอดภัย กรุณาเข้าสู่ระบบใหม่อีกครั้ง ระบบได้บันทึกข้อมูลที่คุณกรอกไว้ให้เรียบร้อยแล้วค่ะ
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleReLogin} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              เข้าสู่ระบบใหม่
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal: แจ้งเตือนว่ามีบัญชีแล้ว (User Already Exists) */}
      <AlertDialog open={userExistsOpen} onOpenChange={setUserExistsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>บัญชีนี้ลงทะเบียนแล้ว</AlertDialogTitle>
            <AlertDialogDescription>
              บัญชี LINE นี้ได้ทำการลงทะเบียนในระบบเรียบร้อยแล้ว ท่านสามารถเข้าทำรายการหรือตรวจสอบข้อมูลผ่านเมนูใน LINE ได้ทันทีค่ะ
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleCloseLiff} className="w-full bg-slate-800 hover:bg-slate-900 text-white">
              ปิดหน้าต่าง
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
