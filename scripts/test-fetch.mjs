async function main() {
  console.log("Fetching...");
  try {
    const res = await fetch("https://ep-steep-wind-abejzkn2.eu-west-2.aws.neon.tech/");
    console.log("Status:", res.status);
  } catch (error) {
    console.error("Fetch failed:", error);
  }
}
main();
