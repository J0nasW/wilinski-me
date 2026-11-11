---
title: 'Who carries a new idea? Concepts in co-authorship networks'
description: 'Ideas spread through people before they spread through citations. Yearly co-authorship networks of AI research, what diffusion research and network sociology predict about them, and how mined concepts can be put on top to test it.'
pubDate: '2025-05-12'
heroImage: '/assets/img/title_img/bg11-unsplash.jpg'
heroImageAttribution: 'unsplash'
heroImageCredit: 'Alina Grubnyak'
heroImageLink: 'https://unsplash.com/photos/ZiQkhI7417A'
tags: ['networks', 'science of science', 'sociology of science', 'community detection']
draft: false
---

The [previous post](/en/blog/2025-02_attention_concept_mining/) was about recognising AI concepts in text, including the rare ones nobody has put in a dictionary yet. This one covers the second half of the same [AOM 2025 paper](/en/publications/2025-aom-ai-communities/) with Juergen Thiesen and Oliver Specht, and it is the more social-science half. Once you know which concepts a paper uses, the question becomes a sociological one: through which people, and which kinds of relationships, does a new idea get from the group that invented it to everyone else?

## An old question with new data

Sociology has been asking this for a long time. Rogers' *Diffusion of Innovations* (2003, first edition 1962) describes adoption as a social process: an innovation moves through communication channels between people, first to a small group of innovators and early adopters, then to the majority. Crane (1972) called the small, tightly connected groups at the research front "invisible colleges": researchers who know each other, share unpublished work and carry a specialty forward together.

Network sociology adds two ideas about *where* in a network new things travel. Granovetter (1973) argued that new information mostly reaches us through weak ties, acquaintances outside our own tight circle, because our close contacts already know what we know. Burt (2004) made a similar point about structural holes: people who bridge otherwise disconnected groups are exposed to more varied ideas and are disproportionately the ones who have good ones. And homophily (McPherson et al., 2001), the tendency to connect with people similar to us, explains why groups stay tight in the first place.

Put together, these give a clear expectation for science. A new method should start inside a dense group, stay there for a while, and spread when someone who sits between groups picks it up. What has been missing is data that connects *concrete ideas* to *concrete relationships* at the scale of a whole field. That is what this paper sets up.

## Why co-authorship and not citations

The default tool in science of science is the citation graph. It is large, well-studied and available everywhere. But a citation says that one paper builds on another. It says very little about *how* the knowledge got there. Did the citing author read the paper on arXiv? Did they share an office with the first author? Did a PhD student move from one lab to the other and bring the method along?

Co-authorship is closer to the actual mechanism. Writing a paper together is a shared project, and ideas move between the people involved and into the groups they work with afterwards. Barabási et al. (2002) showed that collaboration networks have their own evolutionary dynamics. Our argument in the paper is that if you link those dynamics to concrete concepts, you get a much more specific answer to "how did this idea spread?" than citation counts can give.

In the terms from above, a co-authorship is a strong tie: people who wrote a paper together have actually worked together. Citations are closer to reading, which is a much weaker form of contact. So instead of a citation graph we build temporal co-authorship networks: one network per year, nodes are authors who published an AI paper in that year, and an edge means two authors wrote a paper together.

## From the knowledge graph to yearly networks

The raw material is the same PapersWithCode knowledge graph as in the first post: 512,834 papers, 379,915 authors (disambiguated via OpenAlex and Semantic Scholar) and 1,377,263 authorship edges between them. Authorship is a bipartite relation, authors on one side and papers on the other. Collapsing it onto the author side gives the co-authorship network, where every pair of authors on the same paper gets an edge.

That projection has one well-known side effect. A paper with $k$ authors creates $k(k-1)/2$ edges, so a single paper with 50 authors produces 1,225 edges and a perfect little clique. Keep that in mind for the plots below.

Here are four of those yearly networks.

![Co-authorship sociograms for 2004, 2008, 2012 and 2016](/assets/img/blog/aom-2025/sociograms.png)
*Yearly co-authorship networks of AI papers in PapersWithCode for 2004, 2008, 2012 and 2016. In 2004 there are only a handful of isolated groups. By 2016 one large connected core sits in the middle, surrounded by a ring of small groups that are not connected to it.*

The progression is easier to see than to describe. In 2004 the network is a few pairs and triangles plus one tight blob in the middle, which is what a single many-author paper looks like after projection. In 2008 there are many more small islands. In 2012 a connected core with branching arms appears in the centre. In 2016 that core is dense and large, and the ring around it has turned into a thick band of small groups. The paper's own caption puts it plainly: with an increasing number of papers, authors tend to work closer together.

The colours in the sociograms are only there to make the groups easier to tell apart. They do not encode a variable such as community, field or country.

## Six numbers per year

Pictures like these stop working after 2016 because there is simply too much on screen. So each yearly network is also summarised by six metrics.

![Six co-authorship network metrics plotted over time](/assets/img/blog/aom-2025/network-metrics.png)
*Network metrics per year: (a) number of authors, (b) number of co-author edges, (c) average degree, (d) density, (e) size of the largest connected component, (f) average clustering coefficient. Everything before roughly 2005 is based on very few papers and jumps around accordingly.*

Panels (a) and (b) are growth. Both stay close to zero until around 2010 and then rise steeply. In the last year of the plot there are roughly 134,000 authors and a bit over one million co-author edges. Part of that is AI research growing, and part of it is probably PapersWithCode itself, whose coverage is concentrated on recent work.

Panel (c), labelled "average degree of centrality" in the paper, is the average number of co-authors per author:

$$\bar{k} = \frac{2E}{N}$$

With $E \approx 1.08$ million edges and $N \approx 134{,}000$ authors this gives about 16, which matches the last point in the plot. The curve rises steadily from about 2 or 3 around 2010. People write papers with more people. The one outlier is a spike to about 35 in 2008. I read this as the clique effect from above: a year with few authors and at least one paper with a long author list. The large orange blob in the 2008 sociogram fits that reading.

Panel (d), density, is the share of all possible author pairs that are actually connected, $2E / (N(N-1))$. It drops towards zero and stays there, which is not a finding so much as arithmetic. The number of possible pairs grows with $N^2$, while each author only gains a handful of new collaborators. The early values of 1.0 belong to years where the entire network is one small paper.

Panel (e) is the one I find most informative. The largest connected component is the biggest group of authors who can all reach each other through chains of co-authorship. It barely exists before 2012 and then grows to roughly 97,000 authors in the last year. Set against roughly 134,000 authors, that is around 70% of everyone publishing that year sitting in one connected body. This is the core you can see forming in the 2012 and 2016 sociograms.

Panel (f), the average clustering coefficient (Watts and Strogatz, 1998), measures how often an author's co-authors also work with each other. After the noisy early years it climbs steadily to about 0.75. Again partly an artefact of projection, because every paper is a clique. But it also says that collaboration in this field happens in tight groups.

Put (e) and (f) next to each other and you get the picture the paper builds on. High clustering points to local groups that work closely together, Crane's invisible colleges. A growing largest component points to the bridges between them. Clustered locally and connected globally is the signature of a small world (Watts and Strogatz, 1998), and Newman (2001) found the same structure in collaboration networks of physics, biomedicine and computer science. For diffusion it is the setting in which Granovetter's and Burt's arguments matter most: ideas can incubate in small groups and still reach the whole field through a few connecting authors.

## Putting concepts on top

This is where the two halves of the paper connect. Every paper in the knowledge graph carries concepts: PwC tasks, methods and datasets, plus whatever the concept miner from the first post extracts from its text. Since authors are linked through papers, the concepts of a paper can be attached to the co-authorship edges it creates, and from there to the authors.

![Schematic co-authorship network with concept clusters](/assets/img/blog/aom-2025/concept-clusters.png)
*A schematic, not real data. Authors A1 to A6 are connected through papers P1 to P5, and each paper is labelled with concepts (the coloured ellipses). Author A4 sits in the overlap of Image Generation and Graph Neural Networks and connects both groups.*

Figure 3 shows the idea on a toy example. A1 and A2 share a Transformers paper. A2, A3 and A4 are connected through Image Generation papers. A4, A5 and A6 work on Graph Neural Networks. A4 is the interesting node: the one author through whom an idea from the image generation group could reach the GNN group. In Burt's terms, A4 spans a structural hole.

With this layer the sociological arguments turn into questions you can answer with data:

- **Where does a concept start?** Does "Vision Transformer" appear first inside one tightly clustered community, an invisible college, and only later in others?
- **Who carries it across?** Are the authors who bring a concept into a new community brokers in Burt's sense, with ties into several groups? Betweenness centrality and Burt's constraint measure exactly that. Or are they simply the most connected authors?
- **Weak or strong ties?** Does a concept jump between communities along one-off collaborations, or along repeated ones? With yearly networks, a tie can be weighted by how many years it has lasted.
- **One contact or several?** Centola and Macy (2007) showed that some behaviours spread as complex contagions: people adopt only after hearing about them from several contacts. Whether a research group adopts a new method after one co-author uses it, or only after several do, says a lot about how risky adopting it is.
- **Who uses what?** Which authors and groups dominate a given task, method or dataset, and does that change when a new method arrives?

For the community boundaries the paper uses the Louvain method (Blondel et al., 2008), which partitions a network into groups by maximising modularity and scales to networks of this size.

The paper also suggests that concept drift, the change of research themes and methods over time, should be visible as a restructuring of these communities: new collaborations forming around a new method, old groups dissolving or merging. That is the sociological reading of a paradigm shift: not just new words in abstracts, but people reorganising who they work with.

## What is and is not in the paper

Being honest about the state of things: the poster shows the yearly networks and their metrics (Figures 2 and 4) as computed results. The concept overlay in Figure 3 is a schematic of the framework. The claim that widely adopted concepts like transformers often start in smaller clusters before reshaping the broader network is the motivating argument of the paper. It is not a measured result in it. Turning that argument into numbers is the actual work that follows.

There are also limitations I would put on any version of this analysis. PapersWithCode is a selection of AI research, and the strong growth after 2010 mixes the growth of the field with the growth of the platform. Yearly snapshots forget collaborations that were not renewed that year. The projection makes many-author papers look like dense communities. And author disambiguation errors in the source data turn one person into two nodes, or two people into one.

Homophily adds one more caveat. If similar researchers tend to collaborate, then two co-authors using the same method may have chosen each other *because* of the method, not learned it from each other. Telling influence from selection is one of the hardest problems in network research, and a careful version of this analysis needs a design for it, for example by looking at whether adoption follows a new tie or comes before it.

## Where this went next

The full paper is in the [AOM 2025 Proceedings](https://doi.org/10.5465/amproc.2025.23164poster) (Research Methods division), and there is a short overview of all [four AOM 2025 contributions](/en/blog/2025-08_aom_2025/) I was involved in. On the text side, the concept miner kept growing after this paper, and I will write about it separately once that work is out. *Later update:* the PapersWithCode data itself ended up in the [Science Data Lake](/en/blog/2026-02_science_datalake/), next to seven other scholarly sources.
