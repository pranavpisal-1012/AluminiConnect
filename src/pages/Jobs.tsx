"use client"

import type React from "react" // Import the new component
import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import { useAuth } from "../contexts/AuthContext"
import { Briefcase, MapPin, Calendar, X } from "lucide-react"
import { format } from "date-fns"
import toast from "react-hot-toast"

// Add a new EmptyStateMessage component after the Job interface definitions
interface Job {
  id: string
  title: string
  company: string
  description: string
  type: string
  location: string
  requirements: string
  questions: string[]
  created_at: string
}

interface JobApplication {
  job_id: string
  answers: { [key: string]: string }
}

// Add this new component for displaying content to non-logged in users
const EmptyStateMessage = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-8 text-center">
      <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
        <Briefcase className="h-8 w-8 text-blue-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-3">
        {isLoggedIn ? "No job listings available yet" : "Discover Career Opportunities"}
      </h2>
      <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
        {isLoggedIn
          ? "Check back soon as employers add new positions, or be the first to post a job opportunity."
          : "Our platform connects talented professionals with leading companies. Browse our listings to find your next career move."}
      </p>
      {!isLoggedIn && (
        <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">For Job Seekers</h3>
            <p className="text-gray-600 text-sm">
              Explore opportunities across various industries and locations. Our platform makes it easy to find
              positions that match your skills and experience.
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">For Employers</h3>
            <p className="text-gray-600 text-sm">
              Connect with qualified candidates from our alumni network. Post job openings and manage applications
              through our streamlined platform.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewJob, setShowNewJob] = useState(false)
  const [showApplyModal, setShowApplyModal] = useState<string | null>(null)
  const [newJob, setNewJob] = useState({
    title: "",
    company: "",
    description: "",
    type: "full-time",
    location: "",
    requirements: "",
    questions: [""], // Default with one empty question
  })
  const [applicationAnswers, setApplicationAnswers] = useState<{ [key: string]: string }>({})
  const { user } = useAuth()

  useEffect(() => {
    fetchJobs()
  }, [])

  async function fetchJobs() {
    try {
      const { data, error } = await supabase.from("jobs").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setJobs(data || [])
    } catch (error) {
      toast.error("Error loading jobs")
    } finally {
      setLoading(false)
    }
  }

  async function createJob(e: React.FormEvent) {
    e.preventDefault()
    if (!user) {
      toast.error("Please sign in to post a job")
      return
    }

    // Filter out empty questions
    const filteredQuestions = newJob.questions.filter((q) => q.trim() !== "")

    try {
      const { error } = await supabase.from("jobs").insert([
        {
          ...newJob,
          questions: filteredQuestions,
          posted_by: user.id,
        },
      ])

      if (error) throw error
      toast.success("Job posted successfully!")
      setNewJob({
        title: "",
        company: "",
        description: "",
        type: "full-time",
        location: "",
        requirements: "",
        questions: [""],
      })
      setShowNewJob(false)
      fetchJobs()
    } catch (error) {
      toast.error("Error posting job")
    }
  }

  async function applyForJob(jobId: string) {
    if (!user) {
      toast.error("Please sign in to apply")
      return
    }

    try {
      const { error } = await supabase.from("job_applications").insert([
        {
          job_id: jobId,
          applicant_id: user.id,
          answers: applicationAnswers,
        },
      ])

      if (error) {
        if (error.code === "23505") {
          toast.error("You have already applied for this job")
          return
        }
        throw error
      }
      toast.success("Application submitted successfully!")
      setShowApplyModal(null)
      setApplicationAnswers({})
    } catch (error) {
      toast.error("Failed to submit application")
    }
  }

  const addQuestion = () => {
    setNewJob({
      ...newJob,
      questions: [...newJob.questions, ""],
    })
  }

  const removeQuestion = (index: number) => {
    const updatedQuestions = newJob.questions.filter((_, i) => i !== index)
    setNewJob({
      ...newJob,
      questions: updatedQuestions,
    })
  }

  const updateQuestion = (index: number, value: string) => {
    const updatedQuestions = [...newJob.questions]
    updatedQuestions[index] = value
    setNewJob({
      ...newJob,
      questions: updatedQuestions,
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Modify the return statement in the main component to include informative sections when not logged in
  // Replace the existing return statement with this enhanced version
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Job Opportunities</h1>
        {user && (
          <button
            onClick={() => setShowNewJob(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Post a Job
          </button>
        )}
      </div>

      {!user && (
        <div className="mb-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8">
          <div className="max-w-4xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect with Top Employers</h2>
            <p className="text-gray-700 mb-6">
              Our job board connects alumni with exclusive career opportunities from companies looking for talent like
              you. Browse our listings to discover positions from leading organizations in various industries.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white p-5 rounded-lg shadow-sm">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Exclusive Listings</h3>
                <p className="text-gray-600 text-sm">
                  Access job opportunities posted specifically for our alumni network.
                </p>
              </div>
              <div className="bg-white p-5 rounded-lg shadow-sm">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Remote & Local Jobs</h3>
                <p className="text-gray-600 text-sm">
                  Find opportunities that match your location preferences and work style.
                </p>
              </div>
              <div className="bg-white p-5 rounded-lg shadow-sm">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Easy Application</h3>
                <p className="text-gray-600 text-sm">
                  Apply directly through our platform with a streamlined application process.
                </p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Stay Updated</h3>
              <p className="text-gray-600">
                New opportunities are added regularly. Check back often to see the latest positions from companies
                looking for talented professionals like you.
              </p>
            </div>
          </div>
        </div>
      )}

      {!user && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-xl">1</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Create an Account</h3>
              <p className="text-gray-600">
                Sign up using your email to join our alumni network and access job listings.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-xl">2</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Browse Opportunities</h3>
              <p className="text-gray-600">Explore job listings from companies looking to hire alumni like you.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-xl">3</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Apply with Ease</h3>
              <p className="text-gray-600">
                Submit your application directly through our platform with just a few clicks.
              </p>
            </div>
          </div>
        </div>
      )}

      {showNewJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full my-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Post a New Job</h2>
              <button onClick={() => setShowNewJob(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={createJob} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Job Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                  Company
                </label>
                <input
                  type="text"
                  id="company"
                  value={newJob.company}
                  onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Job Type
                </label>
                <select
                  id="type"
                  value={newJob.type}
                  onChange={(e) => setNewJob({ ...newJob, type: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  value={newJob.location}
                  onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Job Description
                </label>
                <textarea
                  id="description"
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="requirements" className="block text-sm font-medium text-gray-700">
                  Requirements
                </label>
                <textarea
                  id="requirements"
                  value={newJob.requirements}
                  onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Application Questions</label>
                  <button type="button" onClick={addQuestion} className="text-sm text-blue-600 hover:text-blue-700">
                    + Add Question
                  </button>
                </div>
                {newJob.questions.map((question, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => updateQuestion(index, e.target.value)}
                      placeholder="Enter your question"
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    {newJob.questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowNewJob(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Post Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showApplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full my-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Apply for Position</h2>
              <button onClick={() => setShowApplyModal(null)} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                applyForJob(showApplyModal)
              }}
              className="space-y-4"
            >
              {jobs
                .find((job) => job.id === showApplyModal)
                ?.questions.map((question, index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium text-gray-700">{question}</label>
                    <textarea
                      value={applicationAnswers[index] || ""}
                      onChange={(e) =>
                        setApplicationAnswers({
                          ...applicationAnswers,
                          [index]: e.target.value,
                        })
                      }
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                ))}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {user && (
        <div className="grid gap-6">
          <div className="featured-jobs-section mb-8">
            <h2 className="text-2xl font-bold">Featured Jobs</h2>
            <p className="text-gray-600">Check out these highlighted job opportunities!</p>
          </div>
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{job.title}</h2>
                    <p className="text-gray-600">{job.company}</p>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {job.type}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-gray-500">
                    <MapPin className="h-5 w-5 mr-2" />
                    {job.location}
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Calendar className="h-5 w-5 mr-2" />
                    Posted {format(new Date(job.created_at), "MMM d, yyyy")}
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="font-semibold text-gray-900">Description</h3>
                  <p className="mt-2 text-gray-600">{job.description}</p>
                </div>

                {job.requirements && (
                  <div className="mt-4">
                    <h3 className="font-semibold text-gray-900">Requirements</h3>
                    <p className="mt-2 text-gray-600">Ensure you meet the following criteria before applying:</p>
                    <p className="mt-2 text-gray-600">{job.requirements}</p>
                  </div>
                )}

                <div className="mt-6">
                  <button
                    onClick={() => setShowApplyModal(job.id)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))
          ) : (
            <EmptyStateMessage isLoggedIn={true} />
          )}
        </div>
      )}

      {!user && (
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">For Employers</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-3">Post Job Opportunities</h3>
              <p className="text-gray-600 mb-4">
                Looking to hire talented professionals? Our platform connects you with qualified candidates from our
                alumni network.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-blue-500">✓</div>
                  <span className="ml-2 text-gray-600">Reach qualified candidates from our alumni network</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-blue-500">✓</div>
                  <span className="ml-2 text-gray-600">Manage applications through our streamlined platform</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-blue-500">✓</div>
                  <span className="ml-2 text-gray-600">Create custom application questions for better screening</span>
                </li>
              </ul>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Employer Benefits</h4>
                <p className="text-gray-600 text-sm">
                  Our platform offers a direct connection to qualified alumni, streamlined application management, and
                  tools to help you find the perfect candidate for your position.
                </p>
              </div>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Why Post Jobs Here?</h3>
              <div className="space-y-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-md bg-blue-500 flex items-center justify-center">
                      <Briefcase className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-base font-medium">Targeted Audience</h4>
                    <p className="mt-1 text-sm text-gray-600">
                      Connect directly with qualified alumni who match your requirements.
                    </p>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-md bg-blue-500 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-base font-medium">Quick Turnaround</h4>
                    <p className="mt-1 text-sm text-gray-600">
                      Receive applications faster from our engaged community of professionals.
                    </p>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-md bg-blue-500 flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-base font-medium">Simplified Process</h4>
                    <p className="mt-1 text-sm text-gray-600">
                      Manage the entire hiring process through our user-friendly platform.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!user && (
        <div className="mt-12 mb-12">
          <h2 className="text-2xl font-bold mb-6">Explore Job Categories</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-2">Technology</h3>
              <p className="text-gray-600 text-sm mb-3">Software development, IT support, data science, and more.</p>
              <div className="text-blue-600 text-sm font-medium">Popular roles:</div>
              <ul className="text-sm text-gray-600 mt-1">
                <li>Software Engineer</li>
                <li>Data Scientist</li>
                <li>Product Manager</li>
              </ul>
            </div>
            <div className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-2">Business</h3>
              <p className="text-gray-600 text-sm mb-3">Marketing, sales, finance, and management positions.</p>
              <div className="text-blue-600 text-sm font-medium">Popular roles:</div>
              <ul className="text-sm text-gray-600 mt-1">
                <li>Marketing Manager</li>
                <li>Financial Analyst</li>
                <li>Business Development</li>
              </ul>
            </div>
            <div className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-2">Healthcare</h3>
              <p className="text-gray-600 text-sm mb-3">Medical, nursing, research, and administrative roles.</p>
              <div className="text-blue-600 text-sm font-medium">Popular roles:</div>
              <ul className="text-sm text-gray-600 mt-1">
                <li>Registered Nurse</li>
                <li>Medical Researcher</li>
                <li>Healthcare Administrator</li>
              </ul>
            </div>
            <div className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-2">Education</h3>
              <p className="text-gray-600 text-sm mb-3">Teaching, administration, and support positions.</p>
              <div className="text-blue-600 text-sm font-medium">Popular roles:</div>
              <ul className="text-sm text-gray-600 mt-1">
                <li>Teacher/Professor</li>
                <li>Educational Consultant</li>
                <li>Academic Advisor</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {!user && (
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6 text-center">Success Stories</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xl">JD</span>
              </div>
              <p className="italic text-gray-600 mb-4">
                "I found my dream job through this platform. The process was smooth and I was able to connect with a
                great company that values my skills."
              </p>
              <p className="font-semibold">John Doe</p>
              <p className="text-sm text-gray-500">Software Engineer</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xl">JS</span>
              </div>
              <p className="italic text-gray-600 mb-4">
                "As an employer, I've found exceptional talent through this job board. The quality of candidates has
                been consistently high."
              </p>
              <p className="font-semibold">Jane Smith</p>
              <p className="text-sm text-gray-500">HR Director</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xl">RJ</span>
              </div>
              <p className="italic text-gray-600 mb-4">
                "The specialized nature of this job board helped me find positions that perfectly matched my experience
                and career goals."
              </p>
              <p className="font-semibold">Robert Johnson</p>
              <p className="text-sm text-gray-500">Marketing Specialist</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

