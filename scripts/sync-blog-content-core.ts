#!/usr/bin/env node

import { createClient } from "@sanity/client";
import dotenv from "dotenv";

dotenv.config({ path: "./.env.local" });

interface PortableTextSpan {
  _key: string;
  _type: "span";
  marks: string[];
  text: string;
}

interface PortableTextBlock {
  _key: string;
  _type: "block";
  style?: "normal" | "h2" | "h3" | "blockquote";
  listItem?: "bullet" | "number";
  level?: number;
  markDefs: Array<{ _key: string; _type: string; href?: string }>;
  children: PortableTextSpan[];
}

interface SanityImageField {
  _type?: string;
  asset?: {
    _ref?: string;
    _type?: string;
  };
  alt?: string;
  caption?: string;
}

interface ArticleTopicSeed {
  title: string;
  slug: string;
  description: string;
  order: number;
}

interface SeedArticle {
  title: string;
  slug: string;
  summary: string;
  dek: string;
  publishedAt: string;
  topicSlug: string;
  body: PortableTextBlock[];
  faqItems?: Array<{
    question: string;
    answer: string;
  }>;
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  productSlugs?: string[];
  coverImageAlt?: string;
  cardImageAlt?: string;
}

interface LegacyBlogPost {
  _id: string;
  _createdAt: string;
  title?: string;
  slug?: {
    current?: string;
  };
  excerpt?: string;
  description?: string;
  content?: PortableTextBlock[] | string;
  featuredImage?: SanityImageField;
  cardImage?: SanityImageField;
  categories?: string[];
  category?: string;
  publishDate?: string;
  seoTitle?: string;
  seoDescription?: string;
  keywords?: string[];
}

interface ReferenceValue {
  _type: "reference";
  _ref: string;
}

interface ExistingArticleDocument {
  coverImage?: SanityImageField;
  cardImage?: SanityImageField;
  editorialUpdatedAt?: string;
  refreshEditorialUpdatedAt?: boolean;
  primaryProduct?: ReferenceValue;
  relatedProducts?: ReferenceValue[];
  seo?: {
    canonicalUrl?: string;
    priority?: number;
    changefreq?: string;
  };
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-03-31";

if (!projectId || !dataset || !token) {
  throw new Error(
    "Missing Sanity configuration. Check NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, and SANITY_API_TOKEN."
  );
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion,
  useCdn: false,
});

const publicClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: "published",
});

let keyCounter = 0;

function createKey(prefix: string) {
  keyCounter += 1;
  return `${prefix}-${keyCounter}`;
}

function textSpan(text: string): PortableTextSpan {
  return {
    _key: createKey("span"),
    _type: "span",
    marks: [],
    text,
  };
}

function paragraph(text: string): PortableTextBlock {
  return {
    _key: createKey("block"),
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [textSpan(text)],
  };
}

function heading(text: string, style: "h2" | "h3" = "h2"): PortableTextBlock {
  return {
    _key: createKey("block"),
    _type: "block",
    style,
    markDefs: [],
    children: [textSpan(text)],
  };
}

function bullet(text: string): PortableTextBlock {
  return {
    _key: createKey("block"),
    _type: "block",
    style: "normal",
    listItem: "bullet",
    level: 1,
    markDefs: [],
    children: [textSpan(text)],
  };
}

function numbered(text: string): PortableTextBlock {
  return {
    _key: createKey("block"),
    _type: "block",
    style: "normal",
    listItem: "number",
    level: 1,
    markDefs: [],
    children: [textSpan(text)],
  };
}

function faq(question: string, answer: string) {
  return { question, answer };
}

function toArticleTopicDocumentId(slug: string) {
  return `articleTopic-${slug}`;
}

function toLegacyArticleTopicDocumentId(slug: string) {
  return `articleTopic.${slug}`;
}

function toArticleDocumentId(slug: string) {
  return `article-${slug}`;
}

function toLegacyArticleDocumentId(slug: string) {
  return `article.${slug}`;
}

function markdownToPortableText(markdown: string) {
  const blocks: PortableTextBlock[] = [];

  markdown.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();

    if (trimmed.length === 0) {
      return;
    }

    if (trimmed.startsWith("### ")) {
      blocks.push(heading(trimmed.slice(4), "h3"));
      return;
    }

    if (trimmed.startsWith("## ")) {
      blocks.push(heading(trimmed.slice(3), "h2"));
      return;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      blocks.push(numbered(trimmed.replace(/^\d+\.\s+/, "")));
      return;
    }

    if (trimmed.startsWith("- ")) {
      blocks.push(bullet(trimmed.slice(2)));
      return;
    }

    blocks.push(paragraph(trimmed));
  });

  return blocks;
}

function normalizeImageField(image: SanityImageField | undefined) {
  if (!image?.asset?._ref) {
    return undefined;
  }

  return {
    _type: "image",
    asset: {
      _type: "reference",
      _ref: image.asset._ref,
    },
    alt: image.alt,
    caption: image.caption,
  };
}

function mergeImageField({
  existingImage,
  nextImage,
  altOverride,
}: {
  existingImage?: SanityImageField;
  nextImage?: SanityImageField;
  altOverride?: string;
}) {
  const normalizedNextImage = normalizeImageField(nextImage);

  if (normalizedNextImage) {
    return {
      ...normalizedNextImage,
      alt: altOverride || normalizedNextImage.alt,
    };
  }

  const normalizedExistingImage = normalizeImageField(existingImage);

  if (!normalizedExistingImage) {
    return undefined;
  }

  return {
    ...normalizedExistingImage,
    alt: altOverride || normalizedExistingImage.alt,
  };
}

const topicSeeds: ArticleTopicSeed[] = [
  {
    title: "Cake by post",
    slug: "cake-by-post",
    description: "Guides for choosing, sending, and timing postal cake orders across the UK.",
    order: 0,
  },
  {
    title: "Celebration planning",
    slug: "celebration-planning",
    description:
      "Practical advice for birthdays, anniversaries, gifting moments, and meaningful celebrations.",
    order: 1,
  },
  {
    title: "Custom cakes",
    slug: "custom-cakes",
    description: "Helpful editorial content for choosing and briefing a custom celebration cake.",
    order: 2,
  },
];

const seedArticles: SeedArticle[] = [
  {
    title: "Postal Cakes I'd Happily Send Anywhere in the UK",
    slug: "best-cakes-you-can-send-by-post-uk",
    summary:
      "The cake formats I can hand to a courier without wincing, and the ones I keep for local delivery because the journey takes too much away from them.",
    dek: "If I would feel tense watching a parcel leave the bakery, I do not call it a postal cake. These are the formats I trust for a proper UK journey, and the ones I would rather keep local, upright, and out of the courier network.",
    publishedAt: "2025-09-17T10:00:00.000Z",
    topicSlug: "cake-by-post",
    body: [
      paragraph(
        "When somebody asks me what cake travels best, I am not thinking about flavour first. I am picturing the whole route from my kitchen to their front door, including the depot, the van, and the moment the box gets put down a bit harder than anybody planned."
      ),
      paragraph(
        "A cake can look beautiful on the bench and still be a poor postal cake. For the post, I want something that keeps its shape, opens neatly, and still tastes settled once it has had a real day inside the parcel network."
      ),
      heading("The first question is not flavour"),
      paragraph(
        "Before flavour comes structure. I am looking at height, crumb, filling, finish, and how much movement the cake can forgive without looking tired when it is opened. If it needs chilled handling all the way through or depends on perfectly upright travel, it has already told me it should stay local."
      ),
      bullet(
        "The cake has to hold together after a full courier route, not only for the first hour after baking."
      ),
      bullet(
        "The filling needs to stay where it belongs instead of shifting once the parcel has been on the move."
      ),
      bullet(
        "Lower formats are easier to brace inside the box and far less likely to look knocked about at the end."
      ),
      bullet(
        "The finish has to cope with ordinary courier handling instead of relying on a perfect, careful journey."
      ),
      heading("The formats I trust most"),
      paragraph(
        "Honey cake is still one of the safest answers because it behaves so well after travel. The layers settle into each other, the texture stays rich rather than drying out, and it still feels generous when somebody opens it the next day."
      ),
      paragraph(
        "Alongside honey cake, I trust brownies, blondies, traybakes, and some loaf cakes when they are wrapped properly. They do not ask the parcel network to protect tall edges, soft fillings, or fine decoration that only looks good when nothing moves."
      ),
      bullet(
        "Layered honey cake still feels like a real gift once it is unwrapped and sliced, which matters more than people think."
      ),
      bullet(
        "Brownies and traybakes are sturdy, easy to portion, and forgiving if the parcel is opened later in the day."
      ),
      bullet(
        "Loaf-style cakes can work beautifully if the finish stays simple and the wrapping is doing its job."
      ),
      heading("Why medovik stays near the top"),
      paragraph(
        "Medovik keeps earning its place because it works with the journey rather than against it. It packs neatly, slices cleanly after delivery, and often tastes even better once it has had time to settle."
      ),
      paragraph(
        "That matters more than people expect. A postal cake still needs to feel special when it lands in Manchester, Bristol, or Aberdeen. Medovik manages that without asking the courier to behave like a wedding planner."
      ),
      heading("What I keep for local delivery"),
      paragraph(
        "Some cakes are much better left to collection or local delivery, and there is no shame in that at all. Fresh cream cakes, very tall buttercream cakes, and anything with delicate toppers are simply asking too much from a parcel route."
      ),
      bullet(
        "Fresh cream, mascarpone-heavy fillings, and chilled desserts need tighter handling than an ordinary courier round can give."
      ),
      bullet(
        "Tall celebration cakes lose too much the moment the box is tipped, stacked, or carried the long way round."
      ),
      bullet(
        "Fresh fruit, fondant toppers, and fine piping create too many points of failure for the post."
      ),
      heading("How I choose between postal cake and custom cake"),
      paragraph(
        "If the priority is reliability, gifting, and getting something safely across the UK, postal cake is usually the sensible answer. If the priority is scale, a very specific finish, or a centrepiece for a room full of people, I will move you towards a custom cake instead."
      ),
      numbered(
        "Choose cake by post when you want the delivery to feel calm and the cake to arrive looking like it was meant to travel."
      ),
      numbered(
        "Choose a custom cake when the finish, size, or venue matters more than the convenience of posting it."
      ),
      numbered(
        "If you are torn, ask yourself which would bother you more on the day: less decoration or less reliability."
      ),
      heading("My short rule of thumb"),
      paragraph(
        "Keep the order honest. Pick a cake that was designed for the post, give enough notice for a sensible dispatch plan, and do not expect a postal product to behave like a tall display cake. That is usually the difference between a calm delivery and a parcel everybody worries about until it lands."
      ),
    ],
    faqItems: [
      faq(
        "What is the safest cake to send by post in the UK?",
        "Usually a lower, denser cake such as honey cake, brownies, or a well-made traybake. These formats keep their shape better, hold moisture well, and sit more securely in flatter packaging."
      ),
      faq(
        "Can buttercream cakes be sent by post?",
        "Some simple ones can, but tall or heavily finished buttercream cakes are usually better kept for local delivery. The more the cake relies on height, clean edges, and decoration staying perfect, the less sensible it is for the post."
      ),
      faq(
        "How do you know a cake is risky for post?",
        "If it needs chilled handling all the way through, depends on delicate decoration, or only looks right when it stays perfectly upright, I would treat it as a local-delivery cake rather than a postal one."
      ),
    ],
    seo: {
      metaTitle: "Best postal cakes to send in the UK | Olgish Cakes",
      metaDescription:
        "Bakery advice on which cakes genuinely travel well by post in the UK, from medovik and brownies to the formats I keep for local delivery only.",
      keywords: ["best cakes by post uk", "postal cakes uk", "cake by post guide"],
    },
    productSlugs: ["cake-by-post"],
    coverImageAlt: "Postal honey cake boxed neatly for UK courier delivery",
    cardImageAlt: "Postal honey cake boxed neatly for UK courier delivery",
  },
  {
    title: "Cake by Post in the UK: What I Tell Customers Before They Order",
    slug: "cake-by-post-uk-complete-guide",
    summary:
      "The questions I want answered before I confirm a cake-by-post order: timing, delivery fit, freshness, and whether the cake really should be travelling at all.",
    dek: "Cake by post works beautifully when the cake, the packaging, and the dispatch day all suit the journey. It gets stressful when somebody wants courier delivery to behave like a hand-delivered showpiece. This is the plain version I give before I say yes to an order.",
    publishedAt: "2025-09-17T10:00:00.000Z",
    topicSlug: "cake-by-post",
    body: [
      paragraph(
        "Cake by post sounds simple until it is tied to a real birthday, a real front door, and somebody's actual week. Then the useful questions appear very quickly: will they be in, what happens if the driver is late, and have we chosen a cake that still looks decent after a depot and a van."
      ),
      paragraph(
        "Once people judge it on those terms, the decision usually gets easier. A postal cake is not a smaller version of a tall celebration cake. It is a different job with a different brief, and it works best when everyone treats it that way."
      ),
      heading("The three things I need to know first"),
      paragraph(
        "Before I am interested in flavour, I want three things clear in my own head: when the parcel needs to land, how easily the recipient can receive it, and whether the chosen cake is built for that kind of journey."
      ),
      paragraph(
        "If one of those answers is shaky, the order usually feels shaky as well. Sorting those practical details early is what keeps the whole thing calm."
      ),
      numbered(
        "The dispatch window needs to make sense for the occasion instead of being squeezed into the last possible slot."
      ),
      numbered(
        "The recipient needs a delivery set-up that suits the parcel, whether that means a letterbox format or somebody being around to receive it."
      ),
      numbered(
        "The cake itself needs to be designed for travel rather than adapted to it at the last minute."
      ),
      heading("What cake by post actually means"),
      paragraph(
        "For me, cake by post means a bakery product designed specifically for UK courier delivery. In practice that usually means a lower format, packaging that limits movement, and a recipe that still eats well after a day in the network."
      ),
      paragraph(
        "It is not a standard celebration cake dropped into a cardboard box as an afterthought. A good postal product is planned around the journey from the beginning."
      ),
      heading("Why dispatch timing affects everything"),
      paragraph(
        "Most problems with cake by post are really timing problems in disguise. Leave it too late and I am not only choosing a cake. I am also judging courier risk, the safest dispatch day, and how close the parcel will get to a Friday bottleneck or a missed-delivery card."
      ),
      paragraph(
        "If the cake is for a birthday or anniversary, I would always rather you think about the workable dispatch window first and the dramatic reveal second. That almost always gives you a better result."
      ),
      heading("The recipient's day matters more than the sender expects"),
      paragraph(
        "A cake can leave the bakery perfectly and still be awkward at the other end. The easiest deliveries are the ones that fit the recipient's normal day. Letterbox-friendly products remove a lot of friction immediately. Larger parcels can work very well too, but they ask more from the household receiving them."
      ),
      paragraph(
        "That is why I ask people to think about the front door, not only the occasion. A thoughtful gift needs to fit the recipient's routine as well as the sender's idea of the moment."
      ),
      heading("Freshness starts with the recipe, not the ribbon"),
      paragraph(
        "Freshness comes from the recipe as much as the wrapping. Dense layered cakes and neatly portioned bakes hold their texture better than fragile sponge formats, and careful wrapping stops extra air and movement from doing damage on the way."
      ),
      bullet("The cake should be baked for delivery, not retrofitted to it afterwards."),
      bullet(
        "The packaging should keep the cake steady enough that opening the box still feels tidy and deliberate."
      ),
      bullet(
        "The storage notes should be simple enough that the recipient knows what to do within a minute of opening the parcel."
      ),
      heading("When cake by post is the right job"),
      paragraph(
        "Cake by post is the right job when you need nationwide reach, a gift that can travel sensibly, and something that still feels generous once it arrives. It is especially useful for birthdays, thank-you parcels, family surprises, and smaller celebrations that do not need a big centrepiece."
      ),
      paragraph(
        "It is also the better choice when reliability matters more than theatre. If the cake has to cross the country, a lower delivery-friendly format is usually the kinder decision."
      ),
      heading("When I would tell you to keep it local"),
      paragraph(
        "If the cake needs height, a very specific design brief, fresh fillings, or a polished display finish for a room full of people, local custom delivery usually makes more sense. Postal cakes do their best work when the format stays lower, sturdier, and easier to protect."
      ),
      paragraph(
        "That is not second-best. It is simply matching the cake to the journey, which is what keeps the order honest in the first place."
      ),
      heading("The short version"),
      numbered("Order early enough that dispatch can be planned properly instead of improvised."),
      numbered(
        "Choose a format that suits the recipient's delivery set-up, not just the look you had in mind."
      ),
      numbered("If the cake needs special handling all the way through, keep it local."),
    ],
    faqItems: [
      faq(
        "How long does cake by post stay fresh?",
        "It depends on the format, but a well-made postal cake should still eat very well for several days after delivery when stored properly. Cakes that settle nicely overnight are usually the strongest postal choice."
      ),
      faq(
        "Does someone need to be at home for delivery?",
        "Not always. Letterbox-friendly formats remove most of the missed-delivery friction. Larger parcels can still work well, but they are best when you know somebody can receive them or bring them in promptly."
      ),
      faq(
        "How much notice should I give for cake by post?",
        "As much notice as you reasonably can, especially for birthdays, weekends, and busy seasonal weeks. More notice gives the bakery room to choose the safer dispatch window instead of forcing the order into the tightest slot."
      ),
      faq(
        "Is cake by post suitable for every kind of celebration cake?",
        "No. It works best for formats designed to travel. Tall decorated cakes, chilled desserts, and very bespoke finishes are usually better handled as local custom orders."
      ),
    ],
    seo: {
      metaTitle: "Cake by post UK guide | What to know before ordering",
      metaDescription:
        "A plain bakery guide to cake by post in the UK, covering dispatch timing, missed deliveries, freshness, and when a local custom cake is the wiser option.",
      keywords: ["cake by post uk", "postal cake delivery", "cake by post guide"],
    },
    productSlugs: ["cake-by-post"],
    coverImageAlt: "Cake by post packaged securely for UK delivery",
    cardImageAlt: "Cake by post packaged securely for UK delivery",
  },
  {
    title: "How I'd Plan a Cake-by-Post Surprise for Someone I Care About",
    slug: "how-surprise-someone-cake-delivery-post",
    summary:
      "A quieter way to plan a cake surprise: choose the right day, the right format, and a note that sounds like you instead of a gift-message generator.",
    dek: "The best cake surprises feel easy at the other end. The parcel fits the person's week, the note sounds natural, and the cake arrives in a format that does not need rescuing the minute it lands.",
    publishedAt: "2025-09-17T10:00:00.000Z",
    topicSlug: "celebration-planning",
    body: [
      paragraph(
        "A cake surprise only feels generous if it fits the person receiving it. The parcel needs to arrive at a workable moment, the format needs to suit how they receive deliveries, and the note should sound like you rather than a greeting-card service."
      ),
      paragraph(
        "That usually means being a bit less theatrical and much more observant. The best surprises are judged well. They do not need to be staged to within an inch of their life."
      ),
      heading("Start with their ordinary week"),
      paragraph(
        "Think first about routine. Will they be at home? Are they away midweek? Would they enjoy opening a parcel in front of colleagues, or would they rather bring it inside and open it quietly after work? A good surprise respects all of that."
      ),
      bullet("Choose a delivery format that suits the way they normally receive parcels."),
      bullet("Pick a flavour that sounds like them, not just the one that photographs best."),
      bullet(
        "If the cake will be shared, think about who they will actually be with when the parcel arrives."
      ),
      heading("Choose the easier day, not only the exact date"),
      paragraph(
        "Birthdays and anniversaries are obvious, but they are not the only good moments. Postal cake also works beautifully as a thank-you, a new-home gift, a good-luck parcel, or something kind in the middle of a rough week."
      ),
      paragraph(
        "Sometimes the better surprise is the one that lands on a quieter day, when the recipient is not already juggling dinner plans, school pick-up, or a house full of guests. If the exact date adds delivery pressure, choose the calmer day."
      ),
      heading("Write the note in your own voice"),
      paragraph(
        "Short is usually best. One sentence that sounds like something you would genuinely say is worth much more than a polished paragraph that could have come from anybody."
      ),
      bullet("Reference a shared memory if that feels natural."),
      bullet("If the moment is emotional, keep the wording plain and warm."),
      bullet("If the gesture is playful, let it stay playful instead of overexplaining it."),
      heading("Decide whether you need an accomplice"),
      paragraph(
        "Sometimes it helps to tell one sensible person in the household, especially if getting the parcel indoors is the main risk. Other times the whole point is that it arrives without anyone organising it in advance."
      ),
      paragraph(
        "If you do bring somebody else in, make sure they are reducing delivery friction instead of turning a simple gift into a committee."
      ),
      heading("Choose a cake that will not need rescuing"),
      paragraph(
        "Postal cake works best when the format helps the surprise rather than complicates it. A lower delivery-friendly cake is usually more thoughtful than something tall or fragile that needs careful staging the second it reaches the kitchen table."
      ),
      paragraph(
        "If the cake arrives neatly, tastes good, and is easy for the recipient to put straight onto the table, the surprise has already done its job."
      ),
      heading("What makes the surprise feel clumsy"),
      paragraph(
        "The mistakes are usually practical rather than emotional. People leave the order too late, choose a format that is awkward to deliver, or focus so hard on the reveal that they forget the recipient still needs a cake they will actually enjoy eating."
      ),
      bullet("Do not leave the timing so late that dispatch turns into guesswork."),
      bullet("Do not assume a bigger or more dramatic cake will automatically feel more personal."),
      bullet("Do not choose a format that adds delivery risk purely for appearance."),
    ],
    faqItems: [
      faq(
        "How far in advance should I order a surprise cake by post?",
        "Leave enough notice for a sensible dispatch window, especially if the gift is tied to a birthday or anniversary. More notice makes it much easier to plan around the recipient instead of forcing the order into a tight slot."
      ),
      faq(
        "Should I tell someone in the household first?",
        "Only if it genuinely helps with delivery. If the recipient can receive parcels easily on their own, a direct surprise usually feels cleaner and more natural."
      ),
      faq(
        "What makes a postal cake surprise feel thoughtful?",
        "Usually it is the combination of good timing, the right cake format, and a message that sounds like the sender rather than a generic card."
      ),
    ],
    seo: {
      metaTitle: "How to surprise someone with cake by post | Olgish Cakes",
      metaDescription:
        "A practical guide to planning a cake-by-post surprise, from choosing the right day and delivery format to writing a note that still sounds like you.",
      keywords: ["cake delivery surprise", "cake by post gift", "postal cake ideas"],
    },
    productSlugs: ["cake-by-post"],
    coverImageAlt: "Cake by post gift box prepared as a surprise delivery",
    cardImageAlt: "Cake by post gift box prepared as a surprise delivery",
  },
  {
    title: "Why Letterbox Cakes Keep Winning People Over",
    slug: "top-5-reasons-order-letterbox-cakes-online",
    summary:
      "Why customers keep coming back to letterbox cake: easier handover, less coordination, and a better fit for ordinary gifting across the UK.",
    dek: "Letterbox cakes win people over for practical reasons. They are easier to receive, easier to send, and often much better suited to real life than a larger cake that needs careful handling and perfect timing.",
    publishedAt: "2025-09-17T10:00:00.000Z",
    topicSlug: "cake-by-post",
    body: [
      paragraph(
        "Letterbox cakes are not popular because people suddenly fell in love with novelty packaging. They are popular because the format removes several awkward parts of sending cake across the country."
      ),
      paragraph(
        "Once somebody receives a parcel that lands neatly through the door and still feels like a proper gift inside, the appeal makes sense very quickly."
      ),
      heading("The handover is simpler"),
      paragraph(
        "The clearest reason people choose letterbox cakes is very simple: there is less delivery drama. If the product is designed properly, it can be delivered with much less coordination and far fewer missed-drop frustrations."
      ),
      bullet("Recipients do not need to stay in for a tight courier window."),
      bullet("The format suits busy households, office gifting, and long-distance birthdays."),
      bullet("It is a calmer option for people who care more about reliability than theatre."),
      heading("They fit the size of the occasion"),
      paragraph(
        "Not every occasion needs a large centrepiece cake. A lot of customers want something thoughtful but proportionate: enough to feel special, but not so large that it becomes awkward to store or wasteful to buy."
      ),
      paragraph(
        "Letterbox cakes sit neatly in that space. They feel considered without demanding a party-sized set-up or a table cleared just for them."
      ),
      heading("They suit how people actually live"),
      paragraph(
        "People choose letterbox cakes because they fit real weekdays. The recipient may be working, doing the school run, travelling back late, or dealing with a house that is already busy enough. A gift that arrives without a complicated handover is often the more thoughtful one."
      ),
      paragraph(
        "That is especially true for long-distance gifting. You can send something personal without relying on local collection, a careful car journey, or somebody waiting in for a van."
      ),
      heading("The surprise often lands better"),
      paragraph(
        "Letterbox cakes also keep the surprise cleaner. A parcel arriving neatly through the door feels spontaneous in a way that a heavily coordinated hand-delivery often does not."
      ),
      paragraph(
        "For birthdays, thank-you gifts, and just-because gestures, that lack of fuss is part of the appeal rather than a drawback."
      ),
      heading("Reliability usually matters more than theatre"),
      paragraph(
        "A good by-post cake is not a compromise if it has been designed for the journey. In many cases it is more reliable than a dramatic cake that only looks its best when it travels two streets, upright, in perfect weather."
      ),
      paragraph(
        "Customers come back when the ordering process is clear and the cake arrives as promised. That matters much more than the box being clever."
      ),
      heading("What to check before you order"),
      paragraph(
        "The best letterbox cake orders are still intentional. Check what kind of cake is actually being sold, whether it has been designed for the post, and whether the bakery explains dispatch and storage clearly. Convenience only helps when the cake behind it is sound."
      ),
    ],
    faqItems: [
      faq(
        "Why do customers choose letterbox cakes instead of standard delivery?",
        "Mostly because the format is easier to receive and easier to send. It reduces missed deliveries and works especially well for smaller celebrations or thoughtful gifts."
      ),
      faq(
        "Are letterbox cakes only for birthdays?",
        "No. They are useful for thank-you gifts, anniversaries, new-home parcels, long-distance celebrations, and ordinary days when you want to send something thoughtful."
      ),
      faq(
        "Does a letterbox cake feel less premium than a larger cake?",
        "Not if it has been designed properly. A neatly packed cake with good flavour and tidy presentation often feels more considered than a larger cake that is awkward to deliver."
      ),
    ],
    seo: {
      metaTitle: "Why order letterbox cakes online | Olgish Cakes",
      metaDescription:
        "Why more customers order letterbox cakes online: easier handover, fewer missed parcels, and a better fit for ordinary gifting across the UK.",
      keywords: ["letterbox cakes uk", "order cake online uk", "postal cake delivery"],
    },
    productSlugs: ["cake-by-post"],
    coverImageAlt: "Letterbox cake packaged flat for easy UK delivery",
    cardImageAlt: "Letterbox cake packaged flat for easy UK delivery",
  },
];

async function ensureTopics() {
  const topicIds = new Map<string, string>();

  for (const topic of topicSeeds) {
    const documentId = toArticleTopicDocumentId(topic.slug);

    await client.createOrReplace({
      _id: documentId,
      _type: "articleTopic",
      title: topic.title,
      slug: {
        _type: "slug",
        current: topic.slug,
      },
      description: topic.description,
      order: topic.order,
    });

    topicIds.set(topic.slug, documentId);
  }

  return topicIds;
}

async function resolveProductLinkage(candidateSlugs: string[] | undefined): Promise<{
  primaryProductReference?: ReferenceValue;
  relatedProductReferences?: ReferenceValue[];
}> {
  if (!candidateSlugs || candidateSlugs.length === 0) {
    return {};
  }

  const products = await client.fetch<
    Array<{
      _id: string;
    }>
  >(
    `*[_type in ["giftHamper", "cake"] && slug.current in $slugs] | order(name asc) {
      _id
    }`,
    { slugs: candidateSlugs }
  );

  if (products.length === 0) {
    return {};
  }

  const references = products.map(product => ({
    _type: "reference" as const,
    _ref: product._id,
  }));

  return {
    primaryProductReference: references[0],
    relatedProductReferences: references.slice(1),
  };
}

function pickLegacyTopicSlug(post: LegacyBlogPost) {
  const signals = [post.slug?.current, post.title, ...(post.categories ?? []), post.category]
    .filter((value): value is string => Boolean(value))
    .join(" ")
    .toLowerCase();

  if (/(custom|bespoke|wedding|design|tier|fondant)/.test(signals)) {
    return "custom-cakes";
  }

  if (/(post|postal|letterbox|delivery|hamper|gift)/.test(signals)) {
    return "cake-by-post";
  }

  return "celebration-planning";
}

async function upsertArticleDocument(input: {
  slug: string;
  title: string;
  summary: string;
  dek: string;
  publishedAt: string;
  topicId: string;
  body: PortableTextBlock[];
  faqItems?: Array<{
    question: string;
    answer: string;
  }>;
  seo: SeedArticle["seo"];
  coverImage?: SanityImageField;
  cardImage?: SanityImageField;
  coverImageAlt?: string;
  cardImageAlt?: string;
  primaryProductReference?: ReferenceValue;
  relatedProductReferences?: ReferenceValue[];
}) {
  const existingArticle = await client.fetch<ExistingArticleDocument | null>(
    `*[_type == "article" && slug.current == $slug][0]{
      coverImage,
      cardImage,
      editorialUpdatedAt,
      refreshEditorialUpdatedAt,
      primaryProduct,
      relatedProducts,
      seo {
        canonicalUrl,
        priority,
        changefreq
      }
    }`,
    { slug: input.slug }
  );

  await client.createOrReplace({
    _id: toArticleDocumentId(input.slug),
    _type: "article",
    title: input.title,
    slug: {
      _type: "slug",
      current: input.slug,
    },
    summary: input.summary,
    dek: input.dek,
    publishedAt: input.publishedAt,
    topic: {
      _type: "reference",
      _ref: input.topicId,
    },
    body: input.body,
    coverImage: mergeImageField({
      existingImage: existingArticle?.coverImage,
      nextImage: input.coverImage,
      altOverride: input.coverImageAlt,
    }),
    cardImage: mergeImageField({
      existingImage: existingArticle?.cardImage,
      nextImage: input.cardImage,
      altOverride: input.cardImageAlt,
    }),
    primaryProduct: input.primaryProductReference || existingArticle?.primaryProduct,
    relatedProducts: input.relatedProductReferences || existingArticle?.relatedProducts,
    editorialUpdatedAt: existingArticle?.editorialUpdatedAt,
    refreshEditorialUpdatedAt: existingArticle?.refreshEditorialUpdatedAt ?? false,
    faqItems: input.faqItems?.map(item => ({
      _key: createKey("faq"),
      question: item.question,
      answer: item.answer,
    })),
    seo: {
      metaTitle: input.seo.metaTitle,
      metaDescription: input.seo.metaDescription,
      keywords: input.seo.keywords,
      canonicalUrl: existingArticle?.seo?.canonicalUrl,
      priority: existingArticle?.seo?.priority,
      changefreq: existingArticle?.seo?.changefreq,
    },
  });
}

async function migrateSeedArticles(topicIds: Map<string, string>) {
  const migratedSlugs: string[] = [];

  for (const seed of seedArticles) {
    const topicId = topicIds.get(seed.topicSlug);

    if (!topicId) {
      throw new Error(`Missing topic id for ${seed.topicSlug}`);
    }

    const productLinkage = await resolveProductLinkage(seed.productSlugs);

    await upsertArticleDocument({
      slug: seed.slug,
      title: seed.title,
      summary: seed.summary,
      dek: seed.dek,
      publishedAt: seed.publishedAt,
      topicId,
      body: seed.body,
      faqItems: seed.faqItems,
      seo: seed.seo,
      coverImageAlt: seed.coverImageAlt,
      cardImageAlt: seed.cardImageAlt,
      primaryProductReference: productLinkage.primaryProductReference,
      relatedProductReferences: productLinkage.relatedProductReferences,
    });

    migratedSlugs.push(seed.slug);
  }

  return migratedSlugs;
}

async function fetchLegacyPosts() {
  return client.fetch<LegacyBlogPost[]>(
    `*[_type == "blogPost"] | order(coalesce(publishDate, _createdAt) desc){
      _id,
      _createdAt,
      title,
      slug,
      excerpt,
      description,
      content,
      featuredImage,
      cardImage,
      categories,
      category,
      publishDate,
      seoTitle,
      seoDescription,
      keywords
    }`
  );
}

function preferLegacyPost(currentPost: LegacyBlogPost, candidatePost: LegacyBlogPost) {
  const currentIsDraft = currentPost._id.startsWith("drafts.");
  const candidateIsDraft = candidatePost._id.startsWith("drafts.");

  if (currentIsDraft !== candidateIsDraft) {
    return candidateIsDraft ? candidatePost : currentPost;
  }

  const currentTimestamp = new Date(currentPost.publishDate || currentPost._createdAt).getTime();
  const candidateTimestamp = new Date(
    candidatePost.publishDate || candidatePost._createdAt
  ).getTime();

  return candidateTimestamp >= currentTimestamp ? candidatePost : currentPost;
}

async function migrateLegacyPosts(topicIds: Map<string, string>) {
  const legacyPosts = await fetchLegacyPosts();
  const dedupedPostsBySlug = new Map<string, LegacyBlogPost>();

  const protectedSlugs = new Set(seedArticles.map(seed => seed.slug));

  for (const post of legacyPosts) {
    const slug = post.slug?.current;

    if (!slug || protectedSlugs.has(slug) || !post.title) {
      continue;
    }

    const existing = dedupedPostsBySlug.get(slug);
    dedupedPostsBySlug.set(slug, existing ? preferLegacyPost(existing, post) : post);
  }

  const migratedSlugs: string[] = [];

  for (const post of dedupedPostsBySlug.values()) {
    const slug = post.slug?.current;
    const title = post.title;

    if (!slug || !title) {
      continue;
    }

    const topicSlug = pickLegacyTopicSlug(post);
    const topicId = topicIds.get(topicSlug);

    if (!topicId) {
      continue;
    }

    const productLinkage =
      topicSlug === "cake-by-post" ? await resolveProductLinkage(["cake-by-post"]) : {};

    const body = Array.isArray(post.content)
      ? post.content
      : markdownToPortableText(post.content || post.description || post.excerpt || title);

    await upsertArticleDocument({
      slug,
      title,
      summary: post.excerpt || post.description || title,
      dek: post.description || post.excerpt || title,
      publishedAt: post.publishDate || post._createdAt,
      topicId,
      body,
      seo: {
        metaTitle: post.seoTitle || title,
        metaDescription: post.seoDescription || post.excerpt || post.description || title,
        keywords: post.keywords || [],
      },
      coverImage: post.featuredImage,
      cardImage: post.cardImage,
      primaryProductReference: productLinkage.primaryProductReference,
      relatedProductReferences: productLinkage.relatedProductReferences,
    });

    migratedSlugs.push(slug);
  }

  return {
    legacyDocumentIds: legacyPosts.map(post => post._id),
    migratedSlugs,
  };
}

async function verifyArticleDocuments(expectedSlugs: string[]) {
  const uniqueSlugs = Array.from(new Set(expectedSlugs));

  const records = await client.fetch<
    Array<{
      slug: string;
      hasBody: boolean;
      hasTopic: boolean;
    }>
  >(
    `*[_type == "article" && slug.current in $slugs]{
      "slug": slug.current,
      "hasBody": count(body) > 0,
      "hasTopic": defined(topic._ref)
    }`,
    { slugs: uniqueSlugs }
  );

  const recordMap = new Map(records.map(record => [record.slug, record]));
  const missingSlugs = uniqueSlugs.filter(slug => !recordMap.has(slug));
  const incompleteSlugs = uniqueSlugs.filter(slug => {
    const record = recordMap.get(slug);

    if (!record) {
      return false;
    }

    return !record.hasBody || !record.hasTopic;
  });

  if (missingSlugs.length > 0 || incompleteSlugs.length > 0) {
    throw new Error(
      `Article verification failed. Missing: ${missingSlugs.join(", ") || "none"}. Incomplete: ${incompleteSlugs.join(", ") || "none"}.`
    );
  }

  return uniqueSlugs.length;
}

async function verifyPublicArticleVisibility(
  expectedArticleSlugs: string[],
  expectedTopicSlugs: string[]
) {
  const uniqueArticleSlugs = Array.from(new Set(expectedArticleSlugs));
  const uniqueTopicSlugs = Array.from(new Set(expectedTopicSlugs));

  const publicArticles = await publicClient.fetch<
    Array<{
      slug: string;
      hasBody: boolean;
      hasTopic: boolean;
    }>
  >(
    `*[_type == "article" && slug.current in $slugs]{
      "slug": slug.current,
      "hasBody": count(body) > 0,
      "hasTopic": defined(topic->slug.current)
    }`,
    { slugs: uniqueArticleSlugs }
  );

  const publicTopics = await publicClient.fetch<Array<{ slug: string }>>(
    `*[_type == "articleTopic" && slug.current in $slugs]{
      "slug": slug.current
    }`,
    { slugs: uniqueTopicSlugs }
  );

  const articleRecordMap = new Map(publicArticles.map(article => [article.slug, article]));
  const topicSlugSet = new Set(publicTopics.map(topic => topic.slug));

  const missingArticleSlugs = uniqueArticleSlugs.filter(slug => !articleRecordMap.has(slug));
  const incompleteArticleSlugs = uniqueArticleSlugs.filter(slug => {
    const record = articleRecordMap.get(slug);

    if (!record) {
      return false;
    }

    return !record.hasBody || !record.hasTopic;
  });
  const missingTopicSlugs = uniqueTopicSlugs.filter(slug => !topicSlugSet.has(slug));

  if (
    missingArticleSlugs.length > 0 ||
    incompleteArticleSlugs.length > 0 ||
    missingTopicSlugs.length > 0
  ) {
    throw new Error(
      `Public visibility verification failed. Missing articles: ${missingArticleSlugs.join(", ") || "none"}. ` +
        `Incomplete articles: ${incompleteArticleSlugs.join(", ") || "none"}. ` +
        `Missing topics: ${missingTopicSlugs.join(", ") || "none"}.`
    );
  }

  return {
    articleCount: uniqueArticleSlugs.length,
    topicCount: uniqueTopicSlugs.length,
  };
}

async function deleteDocuments(documentIds: string[]) {
  const uniqueIds = Array.from(new Set(documentIds));

  if (uniqueIds.length === 0) {
    return 0;
  }

  let transaction = client.transaction();

  for (const documentId of uniqueIds) {
    transaction = transaction.delete(documentId);
  }

  await transaction.commit();

  return uniqueIds.length;
}

async function retireLegacyVisibilityBlockedDocuments() {
  const dottedArticles = await client.fetch<Array<{ _id: string }>>(
    '*[_type == "article" && !(_id in path("*"))]{_id}'
  );
  const dottedTopics = await client.fetch<Array<{ _id: string }>>(
    '*[_type == "articleTopic" && !(_id in path("*"))]{_id}'
  );

  const deletedArticleCount = await deleteDocuments(dottedArticles.map(document => document._id));
  const deletedTopicCount = await deleteDocuments(dottedTopics.map(document => document._id));

  return {
    deletedArticleCount,
    deletedTopicCount,
  };
}

async function removeLegacyArticleFeaturedFlags() {
  const articleIds = await client.fetch<Array<{ _id: string }>>(
    '*[_type == "article" && defined(featured)]{_id}'
  );

  if (articleIds.length === 0) {
    return 0;
  }

  let transaction = client.transaction();

  for (const article of articleIds) {
    transaction = transaction.patch(article._id, {
      unset: ["featured"],
    });
  }

  await transaction.commit();

  return articleIds.length;
}

async function deleteLegacyBlogPosts(documentIds: string[]) {
  return deleteDocuments(documentIds);
}

async function countLegacyBlogPosts() {
  return client.fetch<number>('count(*[_type == "blogPost"])');
}

async function main() {
  const cliFlags = new Set(process.argv.slice(2));
  const shouldDeleteLegacyBlogPosts = !cliFlags.has("--keep-legacy-blog-posts");

  console.log("Syncing new article content into Sanity...");

  const topicIds = await ensureTopics();
  const seedSlugs = await migrateSeedArticles(topicIds);
  const legacyMigration = await migrateLegacyPosts(topicIds);
  const verifiedCount = await verifyArticleDocuments([
    ...seedSlugs,
    ...legacyMigration.migratedSlugs,
  ]);
  const removedFeaturedFlagCount = await removeLegacyArticleFeaturedFlags();
  const legacyVisibilityCleanup = await retireLegacyVisibilityBlockedDocuments();
  const publicVisibility = await verifyPublicArticleVisibility(
    [...seedSlugs, ...legacyMigration.migratedSlugs],
    topicSeeds.map(topic => topic.slug)
  );

  if (shouldDeleteLegacyBlogPosts) {
    const deletedLegacyCount = await deleteLegacyBlogPosts(legacyMigration.legacyDocumentIds);
    const remainingLegacyCount = await countLegacyBlogPosts();

    if (remainingLegacyCount > 0) {
      throw new Error(
        `Legacy blogPost retirement failed. ${remainingLegacyCount} blogPost documents remain after deletion.`
      );
    }

    console.log(`Legacy blogPost documents deleted: ${deletedLegacyCount}`);
  } else {
    console.log("Legacy blogPost deletion skipped because --keep-legacy-blog-posts was provided.");
  }

  console.log("Article sync complete.");
  console.log(`Topics upserted: ${topicIds.size}`);
  console.log(`Seed articles upserted: ${seedSlugs.length}`);
  console.log(`Legacy articles migrated: ${legacyMigration.migratedSlugs.length}`);
  console.log(`Legacy article featured flags removed: ${removedFeaturedFlagCount}`);
  console.log(`Legacy dotted articles deleted: ${legacyVisibilityCleanup.deletedArticleCount}`);
  console.log(`Legacy dotted topics deleted: ${legacyVisibilityCleanup.deletedTopicCount}`);
  console.log(`Verified article slugs: ${verifiedCount}`);
  console.log(`Publicly visible articles verified: ${publicVisibility.articleCount}`);
  console.log(`Publicly visible topics verified: ${publicVisibility.topicCount}`);
}

main().catch((error: unknown) => {
  console.error("Article sync failed:", error);
  process.exit(1);
});

