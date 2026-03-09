import { ServiceRequestForm } from "@/components/forms/service-request-form";
import { SectionHeading } from "@/components/shared/section-heading";
import { serviceCatalog } from "@/data/seed";

export default function ServicesPage() {
  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="Custom Services"
        title="Production Services for Artist Projects"
        description="From full ghost production to specialist finishing, request premium studio support with clear delivery scopes."
      />

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {serviceCatalog.map((service) => (
          <article key={service.name} className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-[0_16px_50px_rgba(12,20,38,0.06)]">
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Starting at {service.startingAt}</p>
            <h3 className="mt-2 text-xl font-semibold text-zinc-950">{service.name}</h3>
            <p className="mt-2 text-sm text-zinc-600">{service.description}</p>
          </article>
        ))}
      </section>

      <ServiceRequestForm />
    </div>
  );
}
