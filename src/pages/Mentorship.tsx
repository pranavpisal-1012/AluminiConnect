import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { MessageCircle, User, X, Paperclip, FileText } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface Question {
  id: string;
  title: string;
  content: string;
  file_url: string | null;
  file_name: string | null;
  created_at: string;
  users: {
    full_name: string;
  };
  mentorship_answers: Answer[];
}

interface Answer {
  id: string;
  content: string;
  file_url: string | null;
  file_name: string | null;
  created_at: string;
  users: {
    full_name: string;
  };
}

export default function Mentorship() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewQuestion, setShowNewQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ 
    title: '', 
    content: '',
    file: null as File | null
  });
  const [showAnswerModal, setShowAnswerModal] = useState<string | null>(null);
  const [newAnswer, setNewAnswer] = useState('');
  const [answerFile, setAnswerFile] = useState<File | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchQuestions();
  }, []);

  async function fetchQuestions() {
    try {
      const { data, error } = await supabase
        .from('mentorship_questions')
        .select(`
          *,
          users (
            full_name
          ),
          mentorship_answers (
            id,
            content,
            file_url,
            file_name,
            created_at,
            users (
              full_name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      toast.error('Error loading questions');
    } finally {
      setLoading(false);
    }
  }

  async function uploadFile(file: File, path: string) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${path}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('mentorship-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('mentorship-files')
        .getPublicUrl(filePath);

      return {
        url: data.publicUrl,
        name: file.name
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async function createQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to ask a question');
      return;
    }

    try {
      let fileUrl = null;
      let fileName = null;

      if (newQuestion.file) {
        const fileData = await uploadFile(newQuestion.file, 'questions');
        fileUrl = fileData.url;
        fileName = fileData.name;
      }

      const { error } = await supabase
        .from('mentorship_questions')
        .insert([
          {
            title: newQuestion.title,
            content: newQuestion.content,
            file_url: fileUrl,
            file_name: fileName,
            asked_by: user.id
          }
        ]);

      if (error) throw error;
      toast.success('Question posted successfully!');
      setNewQuestion({ title: '', content: '', file: null });
      setShowNewQuestion(false);
      fetchQuestions();
    } catch (error) {
      toast.error('Error posting question');
    }
  }

  async function submitAnswer(questionId: string) {
    if (!user) {
      toast.error('Please sign in to answer');
      return;
    }

    try {
      let fileUrl = null;
      let fileName = null;

      if (answerFile) {
        const fileData = await uploadFile(answerFile, 'answers');
        fileUrl = fileData.url;
        fileName = fileData.name;
      }

      const { error } = await supabase
        .from('mentorship_answers')
        .insert([
          {
            question_id: questionId,
            content: newAnswer,
            file_url: fileUrl,
            file_name: fileName,
            answered_by: user.id
          }
        ]);

      if (error) throw error;
      toast.success('Answer posted successfully!');
      setNewAnswer('');
      setAnswerFile(null);
      setShowAnswerModal(null);
      fetchQuestions();
    } catch (error) {
      toast.error('Error posting answer');
    }
  }

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
        <h1 className="text-3xl font-bold text-gray-900">Mentorship Forum</h1>
        {user && (
          <button
            onClick={() => setShowNewQuestion(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Ask a Question
          </button>
        )}
      </div>

      {showNewQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Ask a Question</h2>
              <button onClick={() => setShowNewQuestion(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={createQuestion} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Question Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={newQuestion.title}
                  onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                  Question Details
                </label>
                <textarea
                  id="content"
                  value={newQuestion.content}
                  onChange={(e) => setNewQuestion({ ...newQuestion, content: e.target.value })}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Attach File (optional)
                </label>
                <div className="mt-1 flex items-center">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                    <span className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      <Paperclip className="h-4 w-4 mr-2" />
                      Choose File
                    </span>
                    <input
                      type="file"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setNewQuestion({ ...newQuestion, file });
                        }
                      }}
                    />
                  </label>
                  {newQuestion.file && (
                    <span className="ml-3 text-sm text-gray-500">
                      {newQuestion.file.name}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowNewQuestion(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Post Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAnswerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Post an Answer</h2>
              <button onClick={() => setShowAnswerModal(null)} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <textarea
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Write your answer here..."
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Attach File (optional)
                </label>
                <div className="mt-1 flex items-center">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                    <span className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      <Paperclip className="h-4 w-4 mr-2" />
                      Choose File
                    </span>
                    <input
                      type="file"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setAnswerFile(file);
                        }
                      }}
                    />
                  </label>
                  {answerFile && (
                    <span className="ml-3 text-sm text-gray-500">
                      {answerFile.name}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAnswerModal(null);
                    setAnswerFile(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => submitAnswer(showAnswerModal)}
                  disabled={!newAnswer.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Post Answer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {questions.map((question) => (
          <div key={question.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{question.title}</h2>
                  <p className="text-sm text-gray-500">
                    Asked by {question.users.full_name} • {format(new Date(question.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-4 text-gray-600">{question.content}</p>

            {question.file_url && (
              <div className="mt-4">
                <a
                  href={question.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                >
                  <FileText className="h-4 w-4 mr-1" />
                  {question.file_name || 'Attached File'}
                </a>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={() => setShowAnswerModal(question.id)}
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
              >
                <MessageCircle className="h-5 w-5 mr-1" />
                Answer this question
              </button>
            </div>

            {question.mentorship_answers && question.mentorship_answers.length > 0 && (
              <div className="mt-6 border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Answers</h3>
                <div className="space-y-4">
                  {question.mentorship_answers.map((answer) => (
                    <div key={answer.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">{answer.users.full_name}</span>
                        <span className="text-sm text-gray-500">
                          • {format(new Date(answer.created_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <p className="text-gray-600">{answer.content}</p>
                      {answer.file_url && (
                        <div className="mt-2">
                          <a
                            href={answer.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            {answer.file_name || 'Attached File'}
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}