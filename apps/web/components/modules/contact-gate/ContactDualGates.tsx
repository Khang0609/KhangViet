import React from "react";
import { SectionHeading } from "../../ui/SectionHeading";
import { ContactGateA } from "./ContactGateA";
import { ContactGateB } from "./ContactGateB";

export const ContactDualGates: React.FC = () => {
  return (
    <section
      id="contact-gate"
      className="scroll-mt-20 border-t border-black/8 bg-[#f4f1ea] py-20 md:py-28"
    >
      <div className="mx-auto max-w-360 px-5 md:px-8 xl:px-12">
        <SectionHeading
          orientation="vertical"
          eyebrow="Bắt đầu dự án"
          title={
            <>
              Mỗi quy mô dự án.
              <br />
              Một lối vào phù hợp.
            </>
          }
          className="mb-12 max-w-3xl"
        />

        <div className="grid overflow-hidden rounded-2xl border border-black/10 bg-white lg:grid-cols-2">
          <ContactGateA />
          <ContactGateB />
        </div>
      </div>
    </section>
  );
};

export default ContactDualGates;
