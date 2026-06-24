export async function GET() {
  return Response.json({
    success: true,
    message: "Steam API route working!",
  });
}