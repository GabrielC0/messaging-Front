import { NextResponse } from "next/server";

export async function GET() {
  try {
    const backendUrl =
      process.env.NEXT_PUBLIC_GRAPHQL_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "https://messaging-platform-gfnp.onrender.com";

    // Essaie de contacter le backend
    const response = await fetch(`${backendUrl}/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Timeout de 5 secondes pour éviter d'attendre trop longtemps
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        status: "ok",
        frontend: "healthy",
        backend: "healthy",
        timestamp: new Date().toISOString(),
        backendUrl,
        backendData: data,
      });
    } else {
      return NextResponse.json(
        {
          status: "degraded",
          frontend: "healthy",
          backend: "unhealthy",
          timestamp: new Date().toISOString(),
          backendUrl,
          error: `Backend returned ${response.status}`,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    // Si le backend n'est pas accessible, on retourne quand même un statut OK pour le frontend
    return NextResponse.json(
      {
        status: "degraded",
        frontend: "healthy",
        backend: "unreachable",
        timestamp: new Date().toISOString(),
        backendUrl:
          process.env.NEXT_PUBLIC_GRAPHQL_URL ||
          "https://messaging-platform-gfnp.onrender.com",
        error: error instanceof Error ? error.message : "Backend unreachable",
      },
      { status: 200 }
    );
  }
}
