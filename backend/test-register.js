async function test() {
  try {
    console.log("Sending register request...");
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        role: "student",
        department: "Computer Science"
      })
    });
    const data = await res.json();
    console.log("Response:", data);
  } catch (error) {
    console.error("Request failed:", error.message);
  }
}
test();
