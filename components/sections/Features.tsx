"use client"

export function Features() {
  return (
    <section id="features" className="py-[120px] bg-[#000000]">
      <div className="container-page">
        {/* Unlock collective wisdom */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[60px] lg:gap-[120px] mb-[120px]">
          <div className="flex flex-col gap-6">
            <h2 className="type-heading-lg text-[#ffffff]">
              Unlock collective wisdom.
            </h2>
            <p className="type-heading text-[#9a9a9a]">
              Stop managing knowledge. Start using it.
            </p>
          </div>
          <div className="flex flex-col justify-center">
            <p className="type-body text-[#bdbdbd] leading-[1.7]">
              Plug into your team's shared brainpower. Ask Dala to instantly find anything or anyone from any workplace system. Focus on doing your best work with context, conviction and clarity.
            </p>
            <div className="mt-12">
              <a
                href="https://askdala.typeform.com/to/lSujgyr8"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                Request Access
              </a>
            </div>
          </div>
        </div>

        {/* Make decisions with confidence */}
        <div className="mb-[120px]">
          <div className="mb-[60px]">
            <h2 className="type-heading-lg text-[#ffffff] mb-6">
              Make decisions with confidence
            </h2>
            <p className="type-body text-[#bdbdbd] max-w-3xl leading-[1.7]">
              Dala's bleeding-edge AI search tool automates extracting knowledge from across your organisation so that you can take the guesswork out of your work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-[60px]">
            <div className="flex flex-col gap-4">
              <div className="metric-number"> scattered</div>
              <p className="type-body text-[#bdbdbd]">
                This is your workplace today. Countless fragments of critical knowledge scattered across hundreds of disparate systems.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="metric-number">30%</div>
              <p className="type-body text-[#bdbdbd]">
                of your time is spent trying to organise and find the information and expertise you need to do your job.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="metric-number">overwhelmed</div>
              <p className="type-body text-[#bdbdbd]">
                The impossible battle to make sense of this chaos leaves your team feeling overwhelmed and unproductive.
              </p>
            </div>
          </div>

          <div className="mt-[60px] space-y-6 max-w-3xl">
            <p className="type-body text-[#bdbdbd]">
              They're confronted with the anxiety of bothering a busy coworker again, or aimlessly trying to connect the dots with incomplete context.
            </p>
            <p className="type-body text-[#bdbdbd]">
              Existing solutions are cumbersome and quickly become outdated. Yet another decaying system that requires continuous maintenance.
            </p>
            <p className="type-body text-[#bdbdbd]">
              They fail to understand what you need from the vast amounts of information that your team creates every day.
            </p>
          </div>
        </div>

        {/* Spark lightbulb moments */}
        <div className="mb-[120px]">
          <div className="mb-[60px]">
            <h2 className="type-heading-lg text-[#ffffff] mb-6">
              Spark lightbulb moments
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[60px] lg:gap-[120px]">
            <div className="flex flex-col gap-6">
              <p className="type-body text-[#bdbdbd] leading-[1.7]">
                Dala is your intelligent, real-time source of truth that eliminates the cultural, financial and operational struggles of splintered tools.
              </p>
              <p className="type-body text-[#bdbdbd] leading-[1.7]">
                We connect your systems behind the scenes and pull together exactly the knowledge you require into an elegant contextual view.
              </p>
            </div>
            <div className="flex flex-col justify-center">
              <p className="type-body text-[#bdbdbd] leading-[1.7]">
                Just ask Dala for the answer that advances your work, and helps you make better decisions with more confidence.
              </p>
            </div>
          </div>
        </div>

        {/* Build a better world of work */}
        <div className="mb-[120px]">
          <div className="mb-[60px]">
            <h2 className="type-heading-lg text-[#ffffff] mb-6">
              Build a better world of work
            </h2>
            <p className="type-body text-[#bdbdbd] max-w-3xl leading-[1.7]">
              Our mission is to make work more coherent and delightful—reframing productivity from <em>doing more</em> to <a href="https://medium.com/dala-ai/why-we-started-dala-a36fc6cbbdb9" target="_blank" rel="noopener noreferrer" className="text-[#ffb829] hover:text-[#ffc966] transition-colors"><em>being better.</em></a>
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[60px] lg:gap-[120px]">
            <div className="flex flex-col gap-6">
              <p className="type-body text-[#bdbdbd] leading-[1.7]">
                Your happiest and most purposeful moments at work are when you're in flow, intellectually stimulated, and creating value for customers.
              </p>
            </div>
            <div className="flex flex-col justify-center">
              <p className="type-body text-[#bdbdbd] leading-[1.7]">
                We want to recreate that every time you experience Dala. A tool that is completely integrated with how you think, feel and work.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
