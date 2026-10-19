import React from "react";
import { SectionHeading } from "../../ui/SectionHeading";
import { ContactGateA } from "./ContactGateA";
import { ContactGateB } from "./ContactGateB";

export const ContactDualGates: React.FC = () => {
  return (
    <section
      id="contact-gate"
      className="scroll-mt-20 border-t border-white/8 bg-[#0d0e11] py-24 md:py-32"
    >
      <div className="mx-auto max-w-360 px-5 md:px-8 xl:px-12">
        <SectionHeading
          orientation="vertical"
          index="04"
          eyebrow="Start a project"
          title={
            <>
              Mỗi quy mô dự án.
              <br />
              Một lối vào phù hợp.
            </>
          }
          className="mb-12 max-w-3xl"
        />

        <div className="grid border border-white/8 lg:grid-cols-2">
          <ContactGateA />
          <ContactGateB />
        </div>
      </div>
    </section>
  );
};

export default ContactDualGates;
