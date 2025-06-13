<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>BookHive - Text Trace</title>
    <link rel="icon" type="image/x-icon" href="../SRC/circle.png">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Find who said a quote using AI">
    <link rel="stylesheet" href="../CSS/texttrace.css">
</head>
<body>
    <div class="background" aria-hidden="true"></div>

    <main class="content">
        <h1>Who said this?</h1>

        <?php
        if ($_SERVER["REQUEST_METHOD"] == "POST") {
            $quote = $_POST["quote-input"];
            echo "<p class='research-output'>" . htmlspecialchars($quote) . "</p>";
        }
        ?>

        <script type="text/javascript">
            <?php if (isset($quote)) : ?>
                let quote = <?php echo json_encode($quote); ?>;

                async function traceQuote() {
                    

                    const resultContainer = document.getElementById("result");

                    // Loading animation/text
                    const loadingElement = document.createElement('p');
                    loadingElement.id = "loading";
                    loadingElement.className = "loading";
                    loadingElement.textContent = `Analyzing the quote: "${quote}"...`;
                    resultContainer.appendChild(loadingElement);

                    try {
                        const response = await fetch('put the link of the API endpoint here', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                contents: [{
                                    parts: [{
                                        text: `You're a quote analysis expert. Given this quote: "${quote}", respond with (do not add any extra text from yourself) just the subtitle and the answer:

1. The name of the person who said or wrote it.
2. A short biography (2-3 lines) of the author.
3. In which book or context it was said.
4. A deep analysis of the quote: what it means, why it was said.

Use clear and separate sections for each part. Respond in the same language as the input. If it's not a quote, state that it's not a quote in the language of the input.`
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

                        // Remove loading text
                        loadingElement.remove();

                        let reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "No response received";
                        reply = reply.replace(/\*\*/g, "").replace(/\*/g, "").replace(/#/g, "").trim();
                        const formatted = reply.replace(/\n/g, "<br>");

                        const isRTL = /[\u0600-\u06FF\u0590-\u05FF\u0750-\u077F]/.test(reply);
                        const resultBlock = document.createElement('div');
                        resultBlock.style.padding = '10px';
                        resultBlock.style.border = '1px solid #ccc';
                        resultBlock.style.borderRadius = '10px';
                        resultBlock.style.direction = isRTL ? 'rtl' : 'ltr';
                        resultBlock.style.textAlign = isRTL ? 'right' : 'left';
                        resultBlock.innerHTML = formatted;

                        resultContainer.appendChild(resultBlock);

                    } catch (error) {
                        console.error("Error:", error);
                        loadingElement.remove();
                        let message = "An error occurred while fetching the quote analysis.";
                        if (error.message.includes("403")) {
                            message = "CORS proxy access denied. Please visit https://cors-anywhere.herokuapp.com/ and request temporary access.";
                        }
                        resultContainer.innerHTML += `<p style="color:red;">${message}</p>`;
                    }
                }

                document.addEventListener("DOMContentLoaded", traceQuote);
            <?php endif; ?>
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
