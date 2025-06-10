import axios from "axios"

export const getJudge0LanguageId = (language) => {
  const languageMap = {
    'PYTHON': 109,
    'JAVA' : 91,
    'JAVASCRIPT' : 102 
  }

  return languageMap[language.toUpperCase()]
}

export const submitBatch = async (submissions) => {
  const {data} = await axios.post('https://judge0-ce.p.rapidapi.com/submissions/batch?base64_encoded=false', {submissions}, {
    headers: {
      'x-rapidapi-key': process.env.JUDGE0_API_KEY,
      'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
      'Content-Type': 'application/json'
    }
  })

  console.log("submission result", data)

  return data

}



const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const pollBatchResults = async (tokens) => {
  while(true) {
    const { data } = await axios.get('https://judge0-ce.p.rapidapi.com/submissions/batch', {
  headers: {
    'x-rapidapi-key': process.env.JUDGE0_API_KEY,
    'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
  },
  params: {
    tokens: tokens.join(","),
    base64_encoded: false,
  }
})

  const results = data.submissions

  const isAllDone = results.every(
    (result)=> (result.status.id !== 1 && result.status.id !== 2)
  )

  if(isAllDone) return results

  await sleep(1000)

  }  
}
