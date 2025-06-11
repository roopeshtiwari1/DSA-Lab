import { db } from "../libs/db.js"
import { getJudge0LanguageId, pollBatchResults, submitBatch } from "../libs/judge0.lib.js"


export const createProblem = async (req, res) => {
  const { title, description, difficulty, tags, examples, constraints, testcases, codeSnippets, referenceSolutions } = req.body

  if(req.user.role !== "ADMIN") {
    return res.status(403).json({error:"You are not allowed to create a problem"})
  }

  try {
    
    for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
      const languageId = getJudge0LanguageId(language)

      if(!languageId) {
        return res.status(400).json({error:`${language} language is not supported`})
      }

      const submissions = testcases.map(({input, output})=> (
        {
          "language_id": languageId,
          "source_code": solutionCode,
          "stdin": input,
          "expected-output" : output
        }
      ))

      const submissionResults = await submitBatch(submissions)

      const tokens = submissionResults.map((res)=> res.token)

      const results = await pollBatchResults(tokens)

      for( let i = 0; i< results.length; i++) {
        const result = results[i]

        if(result.status.id !== 3) {
          return res.status(400).json({error: `Testcase ${i+1} failed for${language} language`})
        }
      }

      const newProblem = await db.problem.create({
        data: {
          title, description, difficulty, tags, examples, constraints, testcases, codeSnippets, referenceSolutions, userId: req.user.id
        }
      })
      return res.status(201).json(newProblem)

    }
  } catch (error) {
    console.log("Error While Creating Problem",error);
    return res.status(500).json({
      error: "Error While Creating Problem",
    });
  }

}

export const getAllProblem = async (req, res) => {
  try {
    const problems = await db.problem.findMany({})
    if(!problems) {
      return res.status(404).json({
        error: "No problems Found",
      });
    }

    res.status(200).json({
      success: true,
      message: "message fetched successfully",
      problems
    })
  } catch (error) {
    console.log("Error While Fetching All Problems:",error);
    return res.status(500).json({
      error: "Error While Fetching All Problems",
    });
  }
}

export const getProblemById = async (req, res) => {
  const {id} = req.params

  try {
    const problem = await db.problem.findUnique({
      where: {
        id
      }
    })

    if (!problem) {
      return res.status(404).json({ error: "Problem not found." });
    }

    return res.status(200).json({
      sucess: true,
      message: "problem fetched Successfully",
      problem,
    });
  } catch (error) {
    console.log("Error While Fetching Problem by id",error);
    return res.status(500).json({
      error: "Error While Fetching Problem by id",
    });
  }
}

export const updateProblem = async (req, res) => {
  const {id} = req.params
  const { title, description, difficulty, tags, examples, constraints, testcases, codeSnippets, referenceSolutions } = req.body

  if(req.user.role !== "ADMIN") {
    return res.status(403).json({error:"You are not allowed to create a problem"})
  }

  try {
    
    for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
      const languageId = getJudge0LanguageId(language)

      if(!languageId) {
        return res.status(400).json({error:`${language} language is not supported`})
      }

      const submissions = testcases.map(({input, output})=> (
        {
          "language_id": languageId,
          "source_code": solutionCode,
          "stdin": input,
          "expected-output" : output
        }
      ))

      const submissionResults = await submitBatch(submissions)

      const tokens = submissionResults.map((res)=> res.token)

      const results = await pollBatchResults(tokens)

      for( let i = 0; i< results.length; i++) {
        const result = results[i]

        if(result.status.id !== 3) {
          return res.status(400).json({error: `Testcase ${i+1} failed for${language} language`})
        }
      }

      const updatedProblem = await db.problem.update({
        where: {
          id
        },
        data: {
          title, description, difficulty, tags, examples, constraints, testcases, codeSnippets, referenceSolutions, userId: req.user.id
        }
      })
      return res.status(201).json(updatedProblem)

    }
  } catch (error) {
    console.log("Error While Updating Problem",error);
    return res.status(500).json({
      error: "Error While updating Problem",
    });
  }
}

export const deleteProblem = async (req, res) => {
  const {id} = req.params
   if(req.user.role !== "ADMIN") {
    return res.status(403).json({error:"You are not allowed to create a problem"})
  }

  try {
    const problem = await db.problem.findUnique({ where: { id } });

    if (!problem) {
      return res.status(404).json({ error: "Problem Not found" });
    }

    await db.problem.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: "Problem deleted Successfully",
    });
    } catch (error) {
    console.log(error)
    return res.status(500).json({
      error: "Error While deleting the problem",
    });
  }

}

export const getAllProblemsSolvedByUser = async (req, res) => {
   try {
    const problems = await db.problem.findMany({
      where:{
        solvedBy:{
          some:{
            userId:req.user.id
          }
        }
      },
      include:{
        solvedBy:{
          where:{
            userId:req.user.id
          }
        }
      }
    })

    res.status(200).json({
      success:true,
      message:"Problems solved by user fetched successfully",
      problems
    })
  } catch (error) {
    console.error("Error fetching problems solved by user :" , error);
    res.status(500).json({error:"Failed to fetch problems solved by user"})
  }
}
