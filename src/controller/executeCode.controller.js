import { getLanguageName, pollBatchResults, submitBatch } from "../libs/judge0.lib.js"
import {db} from "../libs/db.js"

export const executeCode = async (req, res) => {
  const {source_code, language_id, stdin, expected_outputs, problemId} = req.body
  const userId = req.user.id

  try {
    
    if(
      !Array.isArray(stdin) ||
      stdin.length === 0 ||
      !Array.isArray(expected_outputs) ||
      expected_outputs.length !== stdin.length
    ) {
    return res.status(400).json({error: "invalid or missing test cases"})
    }

    const submissions = stdin.map((input)=> ({
      source_code,
      language_id,
      stdin: input
    }))

    const submitResponse = await submitBatch(submissions)

    const tokens = submitResponse.map((res) => res.token)
    // console.log("tokens from execute", tokens)

    const results = await pollBatchResults(tokens)

    console.log("Result------------------")
    console.log(results)

    //Analyze testcases result

    let allPassed = true

    const detailedResult = results.map((result, i)=> {
      const stdout = result.stdout?.trim()
      const expected_output = expected_outputs[i]
      const passed = stdout === expected_output

      if(!passed) allPassed = false

      return {
        testcase: i+1,
        passed,
        stdout,
        expected: expected_output,
        stderr:result.stderr || null,
        compileOutput: result.compile_output || null,
        status: result.status.description,
        memory: result.memory ? `${result.memory} kb` : undefined,
        time: result.time ? `${result.time} sec` : undefined,
      }
    })

    console.log("detailed result of execute code:", detailedResult)

    const submission = await db.submission.create({
      data:{
        user: {
          connect: { id: userId }
        },
        problem: {
          connect: { id: problemId }
        },
        sourceCode : source_code,
        language : getLanguageName(language_id),
        stdin: stdin.join("\n"),
        stdout: JSON.stringify(detailedResult.map((r)=>r.stdout)),
        stderr : detailedResult.some((r)=> r.stderr) ? JSON.stringify(detailedResult.map((r)=>r.stderr)) : null ,
        compileOutput: detailedResult.some((r)=> r.compile_output) ? JSON.stringify(detailedResult.map((r)=> r.compile_output)) : null,
        status: allPassed ? "Accepted" : "Wrong-Answer",
        memory: detailedResult.some((r) => r.memory) ? JSON.stringify(detailedResult.map((r) => r.memory)) : null,
        time: detailedResult.some((r)=>r.time) ? JSON.stringify(detailedResult.map((r)=> r.time)) : null
      }
    })


    if(allPassed) {
      await db.problemSolved.upsert({
        where: {
          userId_problemId :{
            userId,
            problemId
          }
        },
        update: {},
        create: {
          userId,
          problemId
        }
      })
    }

    const testCaseResults = detailedResult.map((result)=> ({
      submissionId : submission.id,
      testCase : result.testcase,
      passed : result.passed,
      stdout : result.stdout,
      expected : result.expected,
      stderr: result.stderr,
      compileOutput: result.compile_output,
      status: result.status,
      memory: result.memory,
      time: result.time,
    }))

    await db.testCaseResult.createMany({
      data: testCaseResults
    })

    const submissionWithTestCase = await db.submission.findUnique({
      where : {
        id : submission.id
      },
      include : {
        testCases : true
      }
    })

    res.status(200).json({
      success: true,
      message: "code executed successfully",
      submission: submissionWithTestCase
    })

  } catch (error) {
    console.error("Error in executing code:", error.message);
    res.status(500).json({ error: "Failed to execute code" });
  }
}