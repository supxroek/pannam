import { useState, useCallback } from 'react';
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
import { useLiffAuth } from '@/hooks/useLiffAuth';
import { LINE_LIFF_ID_REGISTER } from '@/constants/line-liff';

const TOTAL_FORM_STEPS = 4;

export default function Register() {
  // จัดการ LIFF Auth: user, loading, error, retry
  const { user, loading, error } = useLiffAuth(LINE_LIFF_ID_REGISTER);

  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
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
  });
  const [errors, setErrors] = useState({});
  const [loadingState, setLoadingState] = useState(false);

  const validateStep = (stepIndex) => {
    const newErrors = {};

    if (stepIndex === 0) {
      if (!formData.firstName?.trim())
        newErrors.firstName = 'กรุณากรอกชื่อจริง';
      if (!formData.lastName?.trim())
        newErrors.lastName = 'กรุณากรอกนามสกุล';
      if (!formData.birthDay) newErrors.birthDay = 'กรุณาระบุวันเกิด';
      if (formData.birthMonth === '' || formData.birthMonth === undefined)
        newErrors.birthMonth = 'กรุณาระบุเดือนเกิด';
      if (!formData.birthYear) newErrors.birthYear = 'กรุณาระบุปีเกิด';
    }

    if (stepIndex === 1) {
      const idClean = formData.idCard?.replace(/[^0-9]/g, '') || '';
      if (!idClean || idClean.length !== 13)
        newErrors.idCard =
          'กรุณากรอกเลขบัตรประชาชน 13 หลักให้ครบถ้วน';
      const phoneClean = formData.phone?.replace(/[^0-9]/g, '') || '';
      if (!phoneClean || phoneClean.length < 9 || phoneClean.length > 10)
        newErrors.phone = 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง';
    }

    if (stepIndex === 2) {
      if (!formData.village) newErrors.village = 'กรุณาเลือกหมู่บ้าน';
      if (!formData.houseNumber?.trim())
        newErrors.houseNumber = 'กรุณากรอกบ้านเลขที่';
      if (formData.zone === '' || formData.zone === undefined)
        newErrors.zone = 'กรุณาเลือกโซน';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const handleNext = () => {
    if (!validateStep(step - 1)) return;
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep((prev) => prev - 1);
  };

  const handleGoToStep = (targetStep) => {
    setStep(targetStep + 1);
  };

  const handleSubmit = () => {
    setLoadingState(true);
    setTimeout(() => {
      setLoadingState(false);
      setStep(5);
    }, 2000);
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
                      {user.displayName} and {user.idToken}
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
    </div>
  );
}
