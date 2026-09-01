import { useState, useCallback } from 'react';
import StepIndicator from '../components/ui/StepIndicator';
import WelcomeScreen from '../components/register/WelcomeScreen';
import Step1PersonalInfo from '../components/register/Step1PersonalInfo';
import Step2ContactInfo from '../components/register/Step2ContactInfo';
import Step3AddressInfo from '../components/register/Step3AddressInfo';
import Step4Review from '../components/register/Step4Review';
import SuccessScreen from '../components/register/SuccessScreen';

const stepTitles = ['ข้อมูลส่วนตัว', 'ข้อมูลติดต่อ', 'ที่อยู่', 'ตรวจสอบ'];
const stepSubTitles = ['กรอกชื่อ-นามสกุล และวันเกิดของคุณ', 'กรอกเลขบัตรประชาชนและเบอร์โทรศัพท์', 'เลือกหมู่บ้านและระบุที่อยู่ของคุณ', 'กรุณาตรวจสอบความถูกต้องก่อนยืนยัน']
const TOTAL_FORM_STEPS = 4;

export default function Register() {
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
  const [loading, setLoading] = useState(false);

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
    if (step > 1) setStep((prev) => prev - 1);
  };

  const handleGoToStep = (targetStep) => {
    setStep(targetStep + 1);
  };

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(5);
    }, 2000);
  };

  const handleReset = () => {
    setFormData({
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
    setErrors({});
    setStep(0);
  };

  // Step 0: Welcome Screen
  if (step === 0) return <WelcomeScreen onStart={() => setStep(1)} />;

  // Step 5: Success Screen
  if (step === 5) return <SuccessScreen data={formData} onReset={handleReset} />;

  // Steps 1-4: Form Steps
  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col">
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full bg-white min-h-screen shadow-xl">
        {/* Sticky Header */}
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm px-5 pt-4 pb-3">
          <div className="flex items-center gap-3 mb-3">
            {step > 0 && (
              <button
                onClick={handleBack}
                className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
              >
                <i className="fas fa-arrow-left"></i>
              </button>
            )}
            <div className="flex-1">
              <StepIndicator
                currentStep={step - 1}
                totalSteps={TOTAL_FORM_STEPS}
              />
              <p className="text-xs text-slate-400 font-medium">
                ขั้นตอนที่ {step} จาก {TOTAL_FORM_STEPS}
              </p>
              <h1 className="text-lg font-bold text-slate-800">
                {stepTitles[step - 1]}
              </h1>
              <p className='text-slate-500 text-sm'>
                {stepSubTitles[step - 1]}
              </p>
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
                loading={loading}
              />
            )}
          </div>
        </div>

        {/* Sticky Bottom Button (Steps 1-3 only) */}
        {step < 4 && (
          <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-slate-100 px-5 py-4">
            <button
              onClick={handleNext}
              className="w-full bg-linear-to-r from-[#3b82f6] to-[#1e40af] text-white font-semibold py-4 rounded-2xl shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 active:scale-[0.98] transition-all duration-200 text-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>ถัดไป</span>
              <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
