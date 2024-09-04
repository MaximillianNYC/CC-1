![Concept Calculator Banner](public/ogImage.png)

# CC-1 Concept Calculator
CC-1 is an LLM-powered word arithmetic calculator designed & developed by [Maximillian Piras](https://www.maximillian.nyc) as an experiment to explore AI UX [beyond chatbots](https://www.smashingmagazine.com/2024/02/designing-ai-beyond-conversational-interfaces/). It allows you to insert concepts, as in any collection of words representing some notion of cultural significance, to perform mathematical operations (+, -, ×, ÷) resulting in a logical ‘solution’. 

## Intention
This interface intends to make it easy to peer into an LLM’s world model by seeing what connections it draws between concepts. However, the results are far from the objectivity of a numerical calculation, as they’re inextricably influenced by necessary prompt engineering. To account for this subjectivity, all the code is open-sourced so anyone can look under the hood. If this project isn’t instructive at all, hopefully, it at least serves as a fun toy that spits out some entertaining answers.

## Calculator Controls
As you’ll see if you take a look at the system prompt (see `cc-proxy-server/server.js`), these are each operation’s current definitions. The intent was to draw a logical counterpart to their mathematical operation which would yield an equivalent semantic result, but this is still a work in progress.

`(+) Addition` Combine the best traits of multiple concepts to form a new concept where the result is an expansion or a blended outcome that maintains identifiable characteristics of both inputs. This result is generally positive or neutral and emphasizes co-existence. 

`(-) Subtraction` Remove a defining trait or core characteristic, leading to a diminished or simplified version of the original concept. The key is that subtraction results in something less than the original concept, not just in a different form, but weakened in meaning, value, or complexity. 

`(×) Multiplication` Amplifies or exaggerates key traits of the original concept, resulting in a more powerful, enhanced version. The output should feel stronger or more exaggerated than the sum of its parts. Multiplication can also imply synergy, where the result is more than the sum of the individual elements.

`(÷) Division` Breakdown a concept into specific, smaller components or fragments, with a narrower scope or purpose. The result should be more specific or focused, often resulting in a subset or fragment of the original idea, rather than a new combination or synergy.

## Model(s)
The current model is OpenAI’s `GPT4o-mini` but more will hopefully be added soon.

## Evals
The results are currently being evaluated through a WIP benchmark which will hopefully be open-sourced soon as well.

## License

CC-1 is under the MIT License.