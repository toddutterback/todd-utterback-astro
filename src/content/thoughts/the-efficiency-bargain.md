---
title: The Efficiency Bargain
description: What we're trading when we trade for speed
publishedAt: 2026-04-06
draft: false
---

## The Dance

There's a dance that industries go through when they discover a new way to make something faster. It happened in steel, in automobiles, in rail. The steps are familiar: a new tool or process compresses the hard work, velocity increases, costs drop, and everyone celebrates the efficiency gain. What's harder to see in the moment is where the hard work went. It didn't disappear. It moved.

Brian Potter's book [The Origins of Efficiency](https://www.goodreads.com/book/show/215581594) helped me identify that music. And once I heard it, I started hearing it everywhere, including in my own engineering team.

## Builders

I don't believe in the dystopian future where more AI means less human work. A competent software engineer with experience, taste, and discretion, coupled with the right AI tooling, is a force to be reckoned with. They're builders. Creators. Engineers.

At my company, tasks that used to take 4 to 6 weeks are now being completed in 2 to 3 days. Most of what's driving that velocity is augmentation: AI working alongside engineers, accelerating work they're still directing and understanding. The engineer is still in the loop at every meaningful step. The AI is a powerful tool in skilled hands.

Because of that, we recently expanded our engineering team from ten to sixteen full-time engineers. The leverage each engineer now has made adding more engineers more valuable, not less.

This is the part that gets written about most. And it's real, but it's only half the story.

## The Agentic Shift

Agentic coding feels like the natural next step after augmentation. If AI can help me write a function faster, why can't it handle entire classes of repetitive work autonomously? The answer is: it can. And increasingly, it does. But every agentic system you introduce is a new node in your application's ecosystem. It has inputs and outputs, failure modes, and edge cases. It does things you didn't fully anticipate. And unlike the code you wrote yourself, line by line, you don't have an intuitive feel for its interior. It's more like a black box. Now, instead of reading some of your coworkers' code for the first time, it's like reading your coworkers' coworkers' code for the first time.

This is the moment Potter's music started playing for me. Because the efficiency gain is real, but the hard work didn't disappear. It moved. It now lives in the monitoring, the debugging, and the maintenance of the systems that made you fast in the first place. The repairman's problem, applied to software.

Here's what this looks like in practice.

## Case Study

Our deployment pipeline relies on feature flags. We ship code to production multiple times a day, and feature flags let us deploy small pieces of work behind a gate. They keep the deploy pipeline clean, avoiding monster pull requests (the packaged changes engineers submit for review), and giving internal stakeholders early access to features while they're still being built. Once a feature is fully rolled out to customers, the flag isn't needed anymore. But there's always a lag. Sometimes just days or weeks, but usually months, between when an engineer last touches a feature and when it's fully live, and the flag can be retired.

That lag creates cruft. Feature flag evaluations run millions of times a day, checking conditions that only ever resolve one way. It's not catastrophic, but it's not free either. Compute is money, and dead code is weight.

So we built an agent to handle it. It monitors our flags, identifies the ones that are no longer branching, and opens pull requests to remove the conditional logic automatically. The engineer doesn't have to remember the feature flag months later. The cleanup happens.

And it works. But it added a node. Now there's another system to understand when something goes wrong, another consideration when troubleshooting, another entry in the inventory of things that can fail. We made the right tradeoff and I'd make it again, but it wasn't free. We don't yet know what it all costs. We haven't had it running long enough to find out.

That last sentence is the one that keeps me honest.

## Ford, Chrysler, and the SaaS Question

Potter writes about Ford, Chrysler, and GM as three companies that each found a different answer to the same efficiency problem. In their early years, Ford owned everything: the entire manufacturing pipeline, down to the raw materials and parts fabrication. Total control. Maximum efficiency at scale. But retooling a Ford plant for a new car model meant shutting it down for months at a cost of hundreds of millions of dollars. The integration that made them fast also made them brittle.

Chrysler took a different approach. They deliberately kept their manufacturing footprint smaller, outsourcing significant portions of production. It made them more dependent on outside vendors but also more nimble. They could change without stopping.

I think about this when I hear people say SaaS is dead. The argument goes: AI makes it cheap enough to build everything in-house, so why keep paying for tools you could replace? It's an appealing idea. But it's the Ford trap. Building everything yourself means owning every failure, every maintenance burden, every retooling cost when something needs to change. The efficiency gain on the front end is real. The bill comes later.

The smarter question isn't build or buy. It's: do you understand what you're taking on either way?

So what can we learn from the industries that have already danced to this music?

## What We Believe

The efficiency gains are real and worth chasing, but they come with a bill. That bill is usually paid in maintenance, complexity, and the unglamorous work of keeping systems running that you didn't fully build yourself. The work doesn't disappear, it moves, but it's still there. 

The other thing those industries learned is that the transition reshapes what skilled work looks like. Ford's best engineers eventually weren't the ones who could build the fastest line. They were the ones who could understand the whole system: where it was fragile, what it could absorb, and when to intervene. That's the engineer I think we're growing into now. Not someone who writes every line, but someone who knows which lines matter, what to hand off, and what to never let out of their sight.

I don't know exactly what the sustained costs of our agentic tools will look like in two years. Nobody does. But I know what I believe: a competent software engineer with experience, taste, and discretion, coupled with the right AI tooling, is one of the most powerful builders alive right now. That's a bet we're making. We expanded our team. We're building. And we're trying to will that future into existence.