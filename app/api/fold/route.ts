export async function POST(request: Request) {
  console.log("fold-check", (await request.text()).slice(0, 4000));

  return new Response(null, { status: 204 });
}
