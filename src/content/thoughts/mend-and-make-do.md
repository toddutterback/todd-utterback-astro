---
title: Mend and Make Do
description: Using what we already know with new agentic tooling
publishedAt: 2026-05-11
draft: false
---

I just finished reading [Maintenance of Everything: Part One](https://www.goodreads.com/book/show/215581569-maintenance-of-everything) by Stewart Brand. It's a great book. It leaned on a lot of ideas from books I already love like [Shop Class as Soul Craft](https://www.goodreads.com/book/show/6261332-shop-class-as-soulcraft) and [Zen and the Art of Motorcyle Maintenance](https://www.goodreads.com/book/show/629.Zen_and_the_Art_of_Motorcycle_Maintenance). Something a little bit different about his book is that he's been writing it in public for the last few years at [Books in Progress]((https://books.worksinprogress.co/book/maintenance-of-everything/addenda/page/introduction)). I've been following along there, and happily snagged the audiobook and printed book when they came out in January of this year. 

## The Maintenance Race

In 1968, nine sailors left England to race solo, nonstop, around the world. Thirty thousand miles with no GPS, no autopilot, and no help if something went wrong in the Southern Ocean, the most punishing stretch of water on earth.

The race is usually told as a story about courage and endurance. Stewart Brand reads it differently. At its core, he argues, it was a contest of maintenance philosophies. And when I came across it, I couldn't stop thinking about the agents we run in our codebase.

Three sailors became legendary. One won. One wandered the Atlantic for months, faking his position logs, unable to face what his boat had become. One finished last in the field and first across the line — ten months alone, half his systems failing, making do the whole way home.

The winner was Robin Knox-Johnston. His boat, SUHAILI, was a slow, thirty-two-foot wooden ketch, built for long passages but not built to win a race like this. He couldn't raise the money for something purpose-built, so he prepared deeply for what he had. His governing principle was four words: make do and mend.

## Simple Systems Survive

Knox-Johnston packed his small boat with tools and materials for every failure he could imagine. Specialized wrenches, canvas, caulking irons, Stockholm tar, spare parts for everything mechanical. He knew SUHAILI the way you know something you've already sailed seventeen thousand miles and repaired with your own hands.

When his hull split off West Africa, he dove under the boat with a hammer. He improvised a repair using canvas strips, caulking, and copper nails, one tack at a time, surfacing to breathe between each. He measured feeler gauge tolerances using pages from his logbook. He collected solder from inside navigation light bulbs to get his radio working again. The improvisation was possible because the systems were simple enough to understand completely, and familiar enough that he could feel where the edges were.

Brand distills this into one of those observations that seem obvious once you've read it: old systems break in familiar ways. New systems break in unexpected ways. That's the thing I keep coming back to with our agents. The ones that work well over time are the ones we understand completely. They have bounded inputs, bounded outputs, a failure surface small enough that when something goes wrong, we know where to look.

## The Trimaran Trap

Donald Crowhurst's boat was faster. A trimaran could sail twice the speed of a ketch like SUHAILI, and Crowhurst was a genuine innovator. He'd designed an elaborate self-righting system for the boat using an inflatable mast bag and automated ballast pumps. The idea was elegant.

The build was rushed and optimistic, as clever ideas sometimes are. When Crowhurst left port on the last permitted day, electrical wires ran everywhere, connected to almost nothing. And in the chaos of departure, left sitting on the dock were all the materials for repairing the boat, the plywood, the fasteners, and the rigging gear. What he had in abundance were electronic parts. He'd prepared deeply for the domain he knew and lightly for everything else.

Within weeks, his self-steering screws vibrated loose because he had no spares. His bilge pumps couldn't run because the specialized piping was never loaded. Water coming through leaky hatches had to be bailed by hand. He never made it past Brazil.

The trimaran trap isn't really about trimarans. It's what happens when a system is so elegant and fast in ideal conditions that the question of what happens when it breaks gets deferred long enough to become someone else's problem. Crowhurst even had a word for maintenance, he called it "sailorizing", and he resented the time it took. The Southern Ocean has a way of collecting on that kind of debt.

I think about this every time someone suggests we make an agent do one more thing while it's already in there.

## Agents as Small Boats

We run agents to handle discrete tasks like removing stale feature flags, routine cleanup, the kind of work that's well-defined enough to hand off. The discipline we've tried to maintain is one task per agent, known inputs and outputs, and a human reviewing the work before it's checked in and becomes official.

The reason for that discipline is basically Knox-Johnston's reason for packing a bosun's bag, a sailmaker's kit, and twelve yards of canvas. When you understand a system completely, you can fix it. When something goes wrong with a focused agent, the failure is legible. You know the shape of the task it was doing, you know what it touches, and you can reason your way to what happened.

Brand's observation about old systems breaking in familiar ways is the thing we're trying to preserve as we add agents to the codebase. Each one is a new node, with new inputs and outputs, new failure modes, and new edge cases we haven't encountered yet. Keeping them small and focused is how we make sure that when we do encounter those edges, we're in a position to deal with them the way Knox-Johnston dealt with his leaking hull: methodically, with the right materials already on board.

## A New Boat Every Day

There's a postscript worth adding. Bernard Moitessier was the sailor who should have won the Golden Globe. He was so far ahead that victory was nearly certain. He fired a message onto the deck of a passing ship saying he wasn't coming back, and kept sailing east toward Tahiti because he wasn't done being at sea. 

His philosophy is worth sitting with. Where Knox-Johnston packed for every failure he could imagine, Moitessier took a different approach entirely. He designed his boat, JOSHUA, so that failures would be rare in the first place. Recycled telephone poles for masts because they were strong and he could climb them easily to inspect and oil the rigging. Steel hull, welded watertight, painted wth 7 coats applied at specific times with explicit drying durations. Sails were made small and heavily reinforced, so he went six months before needing to get out a needle. He stripped the boat of everything that wasn't essential, offloading the engine, the dinghy, four anchors, and nine hundred pounds of chain, because less to maintain meant more freedom. His rule, which he told Brand when they were neighbors in Sausalito, was "a new boat every day." Fix what's beginning to fail before it finishes failing. That's the aspiration, anyway. 

Knox-Johnston showed us how to survive a system we understand completely. Moitessier showed us what it looks like to design the maintenance burden out of the boat before you leave the dock. Both ideas are worth carrying into the work.

If you're writing enterprise software, you might have to approach agentic adoption from the Know-Johnson approach. Make sure you have enough supplies on hand to maintain the systems. But it's worth considering the Moitessier approach, make the system bulletproof from the start, in the setup, in the configuration, in the tooling. Low maintenance to start. I think you earn this second approach from experience, but it should probably always be the goal.