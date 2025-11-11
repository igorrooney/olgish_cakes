import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getClient } from "@/sanity/lib/client";

export const runtime = "edge";

async function getHamper(slug: string) {
  const query = `*[_type == "giftHamper" && slug.current == $slug][0]{
    name,
    slug,
    price,
    images[]{asset->{url}, alt, isMain}
  }`;
  const client = getClient(false);
  return client.fetch(query, { slug });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const hamper = await getHamper(slug);

  const name: string = hamper?.name || "Gift Hamper";
  const price: string = hamper?.price ? `£${hamper.price}` : "";
  const imageUrl: string | undefined =
    hamper?.images?.find((i: any) => i.isMain)?.asset?.url || hamper?.images?.[0]?.asset?.url;

  const bg = imageUrl || "https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png";

  const width = 1200;
  const height = 630;

  return new ImageResponse(
    (
      <div
        style={{
          width: `${width}px`,
          height: `${height}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.45), rgba(0,0,0,0.65)), url(${bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            padding: "40px",
            color: "#fff",
            width: "100%",
          }}
        >
          <img
            src="https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png"
            alt="Olgish Cakes"
            width={180}
            height={80}
            style={{ marginBottom: 20, objectFit: "contain" }}
          />
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              maxWidth: 900,
            }}
          >
            {name}
          </div>
          {price && (
            <div
              style={{
                marginTop: 20,
                fontSize: 44,
                fontWeight: 700,
                backgroundColor: "rgba(255,215,0,0.9)",
                color: "#1c1c1c",
                padding: "8px 20px",
                borderRadius: 999,
              }}
            >
              {price}
            </div>
          )}
          <div style={{ marginTop: 24, fontSize: 26, opacity: 0.95 }}>
            Luxury Ukrainian Gift Hampers
          </div>
          <div style={{ marginTop: 8, fontSize: 20, opacity: 0.9 }}>olgishcakes.co.uk</div>
        </div>
      </div>
    ),
    {
      width,
      height,
    }
  );
}

