<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>BookHive - Book Bridge</title>
    <link rel="icon" type="image/x-icon" href="../SRC/circle.png">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Find books related to your research topic">
    <link rel="stylesheet" href="../CSS/bookbridge.css">
</head>
<body>
    <div class="background" aria-hidden="true"></div>

    <main class="content">
        <h1>Research Topic</h1>
        <?php
        if ($_SERVER["REQUEST_METHOD"] == "POST") {
            $research = $_POST["research"];
            echo "<p class='research-output'>" . htmlspecialchars($research) . "</p>";
        }
        ?>

        <!-- Embed PHP variable into JavaScript -->
        <script type="text/javascript">
            <?php
            if (isset($research)) {
                echo "let subject = '" . addslashes($research) . "';";
            }
            ?>

            async function main() {
                if (typeof subject !== 'undefined' && subject) {
                    document.getElementById("books").innerHTML = `Searching for books about "${subject}"...`;
                }

                try {
                    const response = await fetch('put the link of the API endpoint here', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            contents: [{
                                parts: [{
                                    text: `Give me a list of well-known books about "${subject}". Format each exactly like this: Book Title: Author. Do not include parentheses, commentary, or any extra text. Just return a clean list. u can suggest books as the language of the input if the book writen with that language`
                                }]
                            }]
                        })
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
                    }

                    const data = await response.json();

                    if (data.error) {
                        throw new Error(`API Error: ${data.error.message}`);
                    }

                    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response received";

                    const cleanItems = [...new Set(
                        generatedText
                            .split('\n')
                            .map(line => line.replace(/\s*\(.*?\)\s*/g, '').trim())
                            .filter(line => line)
                    )];

                    const listItems = cleanItems.map(item => `<li>${item}</li>`).join('');
                    document.getElementById("result").innerHTML = `<ul>${listItems}</ul>`;

                } catch (error) {
                    console.error("Error:", error);
                    let message = "An error occurred while fetching the book list.";
                    if (error.message.includes("403")) {
                        message = "CORS proxy access denied. Please visit https://cors-anywhere.herokuapp.com/ and request temporary access.";
                    }
                    document.getElementById("result").innerHTML = `<p style="color:red;">${message}</p>`;
                }
            }

            document.addEventListener("DOMContentLoaded", main);
        </script>

        <div id="result" class="result-container" aria-live="polite">
            <p id="books"></p>
        </div>
    </main>

    <footer>
        <p id="Readc">&copy; 2025 BookHive. All rights reserved.</p>
    </footer>
</body>
</html>
