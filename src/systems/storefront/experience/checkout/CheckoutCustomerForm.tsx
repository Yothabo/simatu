import PhoneInput from 'react-phone-number-input';
import type { CheckoutCustomerFormProps } from './types';

export default function CheckoutCustomerForm({
  fullName,
  phoneNumber,
  errors,
  onFullNameChange,
  onPhoneNumberChange,
}: CheckoutCustomerFormProps) {
  const inputClass =
    'w-full border-0 bg-[#f5f5f5] px-4 py-3 font-heading text-base text-[#4d4d4d] outline-none placeholder:text-[#4d4d4d]/40 focus:outline-none focus:ring-0';

  const labelClass =
    'mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-[#4d4d4d]/40';

  return (
    <div className="mt-3 flex flex-col gap-4">
      <label className="block">
        <div className="mb-1.5 flex items-center justify-between gap-3">
          <span className={labelClass.replace('mb-1.5 ', '')}>
            Full Name {errors.fullName && <span className="text-red-600">*</span>}
          </span>
        </div>
        <input
          type="text"
          autoComplete="name"
          value={fullName}
          onChange={(event) => onFullNameChange(event.target.value)}
          className={inputClass}
          placeholder="Your full name"
          aria-invalid={Boolean(errors.fullName)}
        />
      </label>

      <div>
        <div className="mb-1.5 flex items-center justify-between gap-3">
          <label htmlFor="whatsapp-number" className={labelClass.replace('mb-1.5 ', '')}>
            WhatsApp Number {errors.phoneNumber && <span className="text-red-600">*</span>}
          </label>
        </div>

        <PhoneInput
          defaultCountry="ZA"
          value={phoneNumber || undefined}
          onChange={(value) => onPhoneNumberChange(value || '')}
          numberInputProps={{
            id: 'whatsapp-number',
            type: 'tel',
            autoComplete: 'tel',
            'aria-label': 'WhatsApp number',
            'aria-invalid': Boolean(errors.phoneNumber),
            placeholder: '71 234 5678',
            className:
              'h-full min-w-0 flex-1 border-0 bg-transparent p-0 font-heading text-base text-[#4d4d4d] outline-none placeholder:text-[#4d4d4d]/40 focus:outline-none focus:ring-0',
          }}
          className="flex h-12 w-full items-center gap-3 bg-[#f5f5f5] px-4"
        />

        {errors.phoneNumber && (
          <p className="mt-1.5 text-xs text-red-600">
            {errors.phoneNumber}
          </p>
        )}
      </div>
    </div>
  );
}
