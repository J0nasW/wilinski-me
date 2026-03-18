---
title: 'Finally, we have compute'
description: 'One thing is certain - unboxing a new workstation with lots of CPU and GPU power never gets old. This is a small blogpost on setting up my new server at TUHH.'
pubDate: '2023-05-12'
heroImage: '/assets/img/title_img/bg05-unsplash.jpg'
heroImageAttribution: 'unsplash'
heroImageCredit: 'ilgmyzin'
heroImageLink: 'https://unsplash.com/de/fotos/hintergrundmuster-X5mBww27HEs'
tags: ['compute', 'gpu', 'infrastructure', 'hpc']
---

# Setting Up a Lenovo ThinkStation P620 as a Remote Development Powerhouse

It arrived in a box that was oversized — the kind of package that got me a look at the central mailing station at TUHH. Inside was a Lenovo ThinkStation P620, a machine that Lenovo designed for engineers, data scientists, and content creators who need serious horsepower. What I wanted to turn it into was something slightly different: a headless, always-on remote development server that I could reach from anywhere. This is the story of how that went.

## The Hardware

Let's start with what's under the hood, because it's worth appreciating - not everything already fitted, but I will get to that later.

| Component | Spec |
|-----------|------|
| **CPU** | AMD Ryzen Threadripper PRO 5945WX — 12 cores, 24 threads, boost up to 4.5 GHz |
| **RAM** | 256 GB DDR4 (8x32 GB) @ 3200 MT/s |
| **GPU** | NVIDIA RTX A4500 |
| **NVMe (Boot)** | Samsung 970 EVO Plus 2TB — OS + Home |
| **NVMe** | Samsung SSD 990 PRO 4TB |
| **NVMe** | 2x Samsung 970 EVO Plus 2TB |
| **NVMe** | Samsung 1TB (MZVL2) |
| **HDD** | 2x Seagate Barracuda 8TB (ST8000DM004) |
| **Total Storage** | ~24 TB |

That's roughly 10 TB of NVMe flash and 16 TB of spinning harddrives, all living inside one tower. Combined with such a strong CPU and GPU for prototyping - I am ready to build some cool stuff.

## Choosing the OS: Why Fedora

This is the part of the story where I spent more time than I'd like to admit.

The ThinkStation P620 is officially supported with Ubuntu and Red Hat Enterprise Linux. I could have gone with Ubuntu here, Red Hat was kind of overkill in my opinion. Ubuntu would have been the path of least resistance — NVIDIA drivers are well-documented, the community is enormous, and half the tutorials on the internet assume you're running it. But I've always had a soft spot for Fedora. It sits in a sweet spot: cutting-edge packages without the instability of a rolling release, strong SELinux defaults, and the DNF package manager that just *makes sense* to me.

Fedora Workstation Edition it was.

The install itself went smoothly — the Fedora installer detected all the hardware without complaint. The NVMe drives showed up immediately. The 970 EVO Plus 2TB became the boot drive with a standard partition layout: a 1 GB `/boot` and the rest split between root and home on a single Btrfs partition. The remaining drives I formatted as XFS and mounted under `/mnt/nvme01` through `/mnt/nvme04` and `/mnt/hdd01` and `/mnt/hdd02`. Nothing fancy, just clean mount points for different workloads — project files, datasets, backups, archives.

The NVIDIA RTX A4500 required the usual Fedora dance: enabling RPM Fusion, installing `akmod-nvidia`, waiting for the kernel module to build, rebooting, and hoping for the best. It worked on the first try. I'll admit I was a little disappointed — I'd mentally prepared for a full afternoon of troubleshooting.

## Making It Reachable: Tailscale

Here's where the project shifted from "set up a workstation" to "set up *our institute's* workstation, reachable from everywhere."

The P620 lives on the TUHH network, behind a router, behind a NAT, behind whatever the university decides to do that day. I needed a way to reach it from my laptop at a coffee shop, from my phone on the train, from another machine at work. I needed it to be seamless, encrypted, and require zero port forwarding.

**Tailscale** was the obvious answer.

```bash
sudo dnf install tailscale
sudo systemctl enable --now tailscaled
tailscale up
```

Three commands. That's it. The machine showed up in my Tailnet, got a stable IP, and suddenly I could SSH into it from any of my other devices. No firewall rules to maintain, no dynamic DNS to configure, no VPN server to babysit. Tailscale's WireGuard-based mesh just works. And best of all, I could easily invite my colleagues to the Tailnet, so they could access the workstation as well.

I enabled MagicDNS so I could reach it as `tie-workstation` rather than remembering an IP. I set up Tailscale SSH so I didn't even need to manage SSH keys manually.

## The Development Environment: code-server

SSH is great, but sometimes you want a full IDE. Enter **code-server** — VS Code running in the browser - and more importantly via tunnel on my local VS Code app.

I installed it, bound it to the Tailscale interface, and suddenly I had a complete Visual Studio Code environment accessible from any browser on my Tailnet. The experience is nearly indistinguishable from running VS Code locally, except all the computation happens on the Threadripper with 256 GB of RAM instead of my laptop's modest specs.

Large codebases that would make my laptop swap? No problem. Docker containers, language servers, build tools — they all run on the workstation while I interact through the code server.

## The Challenges

It wasn't all smooth sailing. Here's what actually tripped me up:

**The RAM speed.** The DIMMs are rated for 3200 MT/s, but the system configures them at 2667 MT/s. This is a known behavior with certain Threadripper PRO configurations where all eight DIMM slots are populated — the memory controller dials back the speed for stability. It bugged me for a day before I accepted the tradeoff: 256 GB at slightly lower speed beats 128 GB at full speed for my workloads.

**Storage planning.** With nearly 24 TB of raw storage, I had to be intentional about what goes where. The boot NVMe handles the OS and active projects. The 990 PRO 4TB is the fast working drive for large datasets and builds. The two additional 970 EVOs hold project archives and VM images. The two 8TB Barracudas are for cold storage and backups. It took a few iterations to settle on a layout that made sense, and I'll probably rearrange it again.

**Fedora's update cadence.** Fedora moves fast. Kernel updates mean waiting for the NVIDIA `akmod` to rebuild. Most of the time it's seamless. Occasionally it isn't, and you're staring at a TTY wondering if this is the update that finally broke your GPU drivers. Having SSH access via Tailscale as a fallback has saved me more than once — even when the display output goes dark, the machine is still reachable on the network.

**Making it truly headless.** The P620 was designed to be a desktop workstation with a monitor attached. Running it headless meant dealing with some BIOS quirks around boot behavior without a display connected, and making sure the NVIDIA driver didn't throw errors when there was no physical monitor plugged in. A dummy HDMI plug solved the GPU issue; a BIOS setting handled the rest.

## The Current State

The workstation has been running for months now. It's become the center of gravity for everything I do:

- **Remote development** via code-server over Tailscale
- **SSH sessions** for terminal-heavy work
- **Container workloads** with plenty of room to breathe
- **Data processing** on the NVMe array
- **Long-running jobs** that would cook my laptop

## Final Thoughts

If you're considering turning a workstation-class machine into a remote development server, here's my advice: **don't overthink the OS choice.** Pick what you know. For me that was Fedora, and it's been rock solid. **Do invest time in your networking layer.** Tailscale turned what could have been a networking nightmare into a three-command setup. And **plan your storage layout early** — it's much easier to decide where things go before you have 10 TB of data scattered across six drives.

The Lenovo ThinkStation P620 was built to sit under a desk and drive multiple 4K displays while rendering CAD models. I stuck it in a closet and access it through a browser. Lenovo's engineers might not have had this use case in mind, but the machine doesn't seem to care. It just works.
