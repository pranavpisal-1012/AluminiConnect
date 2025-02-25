import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Briefcase, MapPin, Calendar, X } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  type: string;
  location: string;
  requirements: string;
  questions: string[];
  created_at: string;
}

interface JobApplication {
  job_id: string;
  answers: { [key: string]: string };
}

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewJob, setShowNewJob] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState<string | null>(null);
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    description: '',
    type: 'full-time',
    location: '',
    requirements: '',
    questions: [''] // Default with one empty question
  });
  const [applicationAnswers, setApplicationAnswers] = useState<{ [key: string]: string }>({});
  const { user } = useAuth();

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      toast.error('Error loading jobs');
    } finally {
      setLoading(false);
    }
  }

  async function createJob(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to post a job');
      return;
    }

    // Filter out empty questions
    const filteredQuestions = newJob.questions.filter(q => q.trim() !== '');

    try {
      const { error } = await supabase
        .from('jobs')
        .insert([
          {
            ...newJob,
            questions: filteredQuestions,
            posted_by: user.id
          }
        ]);

      if (error) throw error;
      toast.success('Job posted successfully!');
      setNewJob({ 
        title: '', 
        company: '', 
        description: '', 
        type: 'full-time', 
        location: '',
        requirements: '',
        questions: ['']
      });
      setShowNewJob(false);
      fetchJobs();
    } catch (error) {
      toast.error('Error posting job');
    }
  }

  async function applyForJob(jobId: string) {
    if (!user) {
      toast.error('Please sign in to apply');
      return;
    }

    try {
      const { error } = await supabase
        .from('job_applications')
        .insert([{ 
          job_id: jobId, 
          applicant_id: user.id,
          answers: applicationAnswers
        }]);

      if (error) {
        if (error.code === '23505') {
          toast.error('You have already applied for this job');
          return;
        }
        throw error;
      }
      toast.success('Application submitted successfully!');
      setShowApplyModal(null);
      setApplicationAnswers({});
    } catch (error) {
      toast.error('Failed to submit application');
    }
  }

  const addQuestion = () => {
    setNewJob({
      ...newJob,
      questions: [...newJob.questions, '']
    });
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = newJob.questions.filter((_, i) => i !== index);
    setNewJob({
      ...newJob,
      questions: updatedQuestions
    });
  };

  const updateQuestion = (index: number, value: string) => {
    const updatedQuestions = [...newJob.questions];
    updatedQuestions[index] = value;
    setNewJob({
      ...newJob,
      questions: updatedQuestions
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
                  <label className="block text-sm font-medium text-gray-700">
                    Application Questions
                  </label>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
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
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
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
            <form onSubmit={(e) => {
              e.preventDefault();
              applyForJob(showApplyModal);
            }} className="space-y-4">
              {jobs.find(job => job.id === showApplyModal)?.questions.map((question, index) => (
                <div key={index}>
                  <label className="block text-sm font-medium text-gray-700">
                    {question}
                  </label>
                  <textarea
                    value={applicationAnswers[index] || ''}
                    onChange={(e) => setApplicationAnswers({
                      ...applicationAnswers,
                      [index]: e.target.value
                    })}
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
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {jobs.map((job) => (
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
                Posted {format(new Date(job.created_at), 'MMM d, yyyy')}
              </div>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold text-gray-900">Description</h3>
              <p className="mt-2 text-gray-600">{job.description}</p>
            </div>

            {job.requirements && (
              <div className="mt-4">
                <h3 className="font-semibold text-gray-900">Requirements</h3>
                <p className="mt-2 text-gray-600">{job.requirements}</p>
              </div>
            )}

            <div className="mt-6">
              <button
                onClick={() => setShowApplyModal(job.id)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Briefcase className="h-5 w-5 mr-2" />
                Apply Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}