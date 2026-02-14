export function calculateMatchScore(candidate, job) {
    const skillsScore = calculateSkillsMatch(candidate.skills, job.job_skills)
    const experienceScore = calculateExperienceMatch(candidate.experience_years, job.title)
    const locationScore = calculateLocationMatch(candidate.location, job.location)
    
    const totalScore = (
      skillsScore * 0.5 +
      experienceScore * 0.3 +
      locationScore * 0.2
    )
    
    return {
      total: Math.round(totalScore),
      skills: Math.round(skillsScore),
      experience: Math.round(experienceScore),
      location: Math.round(locationScore)
    }
  }
  
  function calculateSkillsMatch(candidateSkills, jobSkills) {
    if (!jobSkills || jobSkills.length === 0) return 70
    
    const jobSkillNames = jobSkills.map(s => s.skill_name.toLowerCase())
    const candidateSkillsMap = {}
    
    candidateSkills.forEach(skill => {
      candidateSkillsMap[skill.name.toLowerCase()] = skill.level
    })
    
    let matchedSkills = 0
    let totalWeight = 0
    
    jobSkillNames.forEach(jobSkill => {
      if (candidateSkillsMap[jobSkill]) {
        matchedSkills += candidateSkillsMap[jobSkill]
        totalWeight += 100
      } else {
        totalWeight += 100
      }
    })
    
    return totalWeight > 0 ? (matchedSkills / totalWeight) * 100 : 0
  }
  
  function calculateExperienceMatch(candidateExperience, jobTitle) {
    const requiredExperience = extractRequiredExperience(jobTitle)
    
    if (candidateExperience >= requiredExperience) {
      return 100
    } else if (candidateExperience >= requiredExperience * 0.7) {
      return 85
    } else if (candidateExperience >= requiredExperience * 0.5) {
      return 70
    } else {
      return 50
    }
  }
  
  function extractRequiredExperience(jobTitle) {
    const title = jobTitle.toLowerCase()
    
    if (title.includes('senior') || title.includes('lead') || title.includes('architect')) {
      return 5
    } else if (title.includes('mid') || title.includes('middle')) {
      return 3
    } else if (title.includes('junior')) {
      return 1
    } else {
      return 2
    }
  }
  
  function calculateLocationMatch(candidateLocation, jobLocation) {
    const candLoc = (candidateLocation || '').toLowerCase()
    const jobLoc = (jobLocation || '').toLowerCase()
    
    if (jobLoc.includes('remote')) {
      return 100
    }
    
    if (candLoc.includes(jobLoc) || jobLoc.includes(candLoc)) {
      return 100
    }
    
    if (jobLoc.includes('hybrid')) {
      return 80
    }
    
    return 60
  }
  
  export function predictSuccess(candidate, job, matchScore) {
    const baseScore = matchScore.total
    
    let adjustedScore = baseScore
    
    if (candidate.projects_count > 20) {
      adjustedScore += 5
    }
    
    if (candidate.experience_years > 5) {
      adjustedScore += 3
    }
    
    if (candidate.skills && candidate.skills.length > 10) {
      adjustedScore += 2
    }
    
    adjustedScore = Math.min(adjustedScore, 100)
    
    return {
      successProbability: Math.round(adjustedScore),
      confidence: baseScore >= 80 ? 'high' : baseScore >= 65 ? 'medium' : 'low',
      recommendation: baseScore >= 72 ? 'approve' : 'review'
    }
  }