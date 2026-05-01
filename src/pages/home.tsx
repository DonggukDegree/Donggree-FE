import Icon from '@/assets/Icon.svg?react';
import Button from '@/components/common/button';

export default function Home() {
  return (
    <>
      <Icon />
      {/* Heading */}
      <h1 className="text-heading-1 text-coolgray-90">text-heading-1</h1>
      <h2 className="text-heading-2 text-coolgray-90">text-heading-2</h2>
      <h3 className="text-heading-3 text-coolgray-90">text-heading-3</h3>
      <h4 className="text-heading-4 text-coolgray-90">text-heading-4</h4>
      <h5 className="text-heading-5 text-coolgray-90">text-heading-5</h5>
      <h6 className="text-heading-6 text-coolgray-90">text-heading-6</h6>

      {/* Body */}
      <p className="text-body-l text-coolgray-90">text-body-l</p>
      <p className="text-body-m text-coolgray-90">text-body-m</p>
      <p className="text-body-s text-coolgray-90">text-body-s</p>
      <p className="text-body-xs text-coolgray-90">text-body-xs</p>

      {/* Button */}
      <p className="text-button-xl text-coolgray-90">text-button-xl</p>
      <p className="text-button-l text-coolgray-90">text-button-l</p>
      <p className="text-button-m text-coolgray-90">text-button-m</p>
      <p className="text-button-s text-coolgray-90">text-button-s</p>

      {/* Colors */}
      <p className="text-heading-5 text-primary-30 bg-coolgray-90">text-primary-30</p>
      <p className="text-heading-5 text-primary-60">text-primary-60</p>
      <p className="text-heading-5 text-primary-90">text-primary-90</p>
      <p className="text-heading-5 text-coolgray-10 bg-coolgray-90">text-coolgray-10</p>
      <p className="text-heading-5 text-coolgray-20 bg-coolgray-90">text-coolgray-20</p>
      <p className="text-heading-5 text-coolgray-30">text-coolgray-30</p>
      <p className="text-heading-5 text-coolgray-60">text-coolgray-60</p>
      <p className="text-heading-5 text-coolgray-90">text-coolgray-90</p>
      <p className="text-heading-5 text-chip-green bg-chip-green-bg">text-chip-green</p>
      <p className="text-heading-5 text-chip-red bg-chip-red-bg">text-chip-red</p>
      <p className="text-heading-5 text-alert">text-alert</p>
      <p className="text-heading-5 text-success">text-success</p>

      {/* Buttons */}
      <div className="w-full flex items-center justify-center gap-4">
        <Button className="w-40">primary</Button>
        <Button variant="alert" className="w-40">
          alert
        </Button>
        <Button variant="disabled" className="w-40">
          disabled
        </Button>
        <Button variant="outlined" className="w-40">
          outlined
        </Button>
      </div>
    </>
  );
}
