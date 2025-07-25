import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Search, Lightbulb, Users, Brain, Shield, FileText, HelpCircle, TriangleAlert, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import type { SearchRequest, SearchResponse } from "@shared/schema";
import AILoadingSpinner from "@/components/AILoadingSpinner";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const searchMutation = useMutation({
    mutationFn: async (data: SearchRequest): Promise<SearchResponse> => {
      const response = await apiRequest("POST", "/api/search", data);
      return response.json();
    },
    onSuccess: (data) => {
      setSearchResults(data);
      setError(null);
      setExpandedQuestions(new Set()); // Reset expanded questions for new search
    },
    onError: (err) => {
      setError(err.message || "Failed to get search results. Please try again.");
      setSearchResults(null);
      toast({
        title: "Search Failed",
        description: "Unable to process your search. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    searchMutation.mutate({ query: searchQuery.trim() });
  };

  const handleQuestionClick = (question: string) => {
    setSearchQuery(question);
  };

  const toggleQuestionExpansion = (index: number) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedQuestions(newExpanded);
  };

  const retrySearch = () => {
    if (searchQuery.trim()) {
      searchMutation.mutate({ query: searchQuery.trim() });
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--dark-bg)", color: "var(--text-primary)" }}>
      {/* Header */}
      <header className="py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-4xl font-bold" style={{ color: "var(--text-primary)" }}>
              🍆 PitoyBot
            </h1>
          </div>
          <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
            Get instant answers and discover related questions with AI-powered search
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          
          {/* Search Form */}
          <Card className="rounded-2xl mb-8 shadow-2xl" style={{ backgroundColor: "var(--dark-surface)" }}>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="search-input" className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                    What would you like to know?
                  </Label>
                  <div className="relative">
                    <Input
                      id="search-input"
                      type="text"
                      placeholder="Ask me anything..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-6 py-4 text-lg rounded-xl border-gray-600 focus:ring-2 transition-all duration-200"
                      style={{ 
                        backgroundColor: "var(--dark-surface-2)", 
                        color: "var(--text-primary)",
                        borderColor: "#6b7280"
                      }}
                      disabled={searchMutation.isPending}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                      <Search style={{ color: "var(--text-secondary)" }} className="w-5 h-5" />
                    </div>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full py-4 text-lg font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
                  style={{ 
                    backgroundColor: "var(--primary-blue)", 
                    color: "white"
                  }}
                  disabled={searchMutation.isPending || !searchQuery.trim()}
                >
                  {searchMutation.isPending ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin mr-3">
                        <Brain className="w-5 h-5" />
                      </div>
                      Searching...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <Search className="mr-3 w-5 h-5" />
                      Search
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Loading State */}
          {searchMutation.isPending && (
            <div className="animate-fade-in">
              <Card className="rounded-2xl text-center shadow-2xl" style={{ backgroundColor: "var(--dark-surface)" }}>
                <CardContent className="p-12">
                  <AILoadingSpinner 
                    message="Analyzing your question and searching for the best answer..."
                    size="large"
                  />
                  <div className="mt-6 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <p>🤖 Processing with AI • 🔍 Finding relevant information • ⚡ Generating insights</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="animate-fade-in">
              <Card className="rounded-2xl shadow-2xl border border-red-600" style={{ backgroundColor: "rgba(127, 29, 29, 0.2)" }}>
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    <div className="bg-red-600 p-2 rounded-lg mr-4">
                      <TriangleAlert className="text-white w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-red-400">Something went wrong</h2>
                  </div>
                  
                  <p className="text-red-300 mb-4">{error}</p>
                  
                  <Button 
                    onClick={retrySearch}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                  >
                    <RotateCcw className="mr-2 w-4 h-4" />
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Results */}
          {searchResults && (
            <div className="space-y-6 animate-slide-up">
              
              {/* Direct Answer Card */}
              <Card className="rounded-2xl shadow-2xl border border-gray-700" style={{ backgroundColor: "var(--dark-surface)" }}>
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="bg-green-600 p-2 rounded-lg mr-4">
                      <Lightbulb className="text-white w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Direct Answer</h2>
                  </div>
                  
                  <div className="rounded-xl p-6 border-l-4 border-green-500" style={{ backgroundColor: "var(--dark-surface-2)" }}>
                    <p className="leading-relaxed text-lg" style={{ color: "var(--text-primary)" }}>
                      {searchResults.direct_answer}
                    </p>
                  </div>
                  
                  <div className="mt-4 flex items-center text-sm" style={{ color: "var(--text-secondary)" }}>
                    <Brain className="mr-2 w-4 h-4" />
                    <span>Powered by AI</span>
                  </div>
                </CardContent>
              </Card>

              {/* People Also Ask Card */}
              {searchResults.people_also_ask.length > 0 && (
                <Card className="rounded-2xl shadow-2xl border border-gray-700" style={{ backgroundColor: "var(--dark-surface)" }}>
                  <CardContent className="p-8">
                    <div className="flex items-center mb-6">
                      <div className="bg-blue-600 p-2 rounded-lg mr-4">
                        <Users className="text-white w-6 h-6" />
                      </div>
                      <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>People Also Ask</h2>
                    </div>
                    
                    <div className="space-y-3">
                      {searchResults.people_also_ask.map((item, index) => {
                        const isExpanded = expandedQuestions.has(index);
                        return (
                          <div 
                            key={index}
                            className="rounded-lg border border-gray-600 transition-all duration-200"
                            style={{ backgroundColor: "var(--dark-surface-2)" }}
                          >
                            {/* Question Header */}
                            <div 
                              onClick={() => toggleQuestionExpansion(index)}
                              className="group cursor-pointer p-4 flex items-center justify-between hover:bg-opacity-80"
                            >
                              <p className="font-medium group-hover:text-white flex-1 pr-4" style={{ color: "var(--text-primary)" }}>
                                {item.question}
                              </p>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuestionClick(item.question);
                                  }}
                                  className="text-xs px-2 py-1 h-auto text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                                >
                                  Search
                                </Button>
                                <div className="text-gray-400 group-hover:text-blue-500 transition-all duration-200">
                                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                </div>
                              </div>
                            </div>
                            
                            {/* Expandable Answer */}
                            {isExpanded && (
                              <div className="px-4 pb-4 border-t border-gray-700">
                                <div className="pt-4 rounded-lg p-4" style={{ backgroundColor: "var(--dark-bg)" }}>
                                  <p className="leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                                    {item.answer}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-gray-600">
                      <p className="text-sm flex items-center" style={{ color: "var(--text-secondary)" }}>
                        <HelpCircle className="mr-2 w-4 h-4" />
                        Click the arrow to expand answers, or "Search" to explore further
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 px-4 border-t border-gray-700">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <p style={{ color: "var(--text-secondary)" }}>Powered by</p>
              <div className="flex items-center space-x-2">
                <Brain style={{ color: "var(--primary-blue)" }} className="w-5 h-5" />
                <span className="font-semibold" style={{ color: "var(--text-primary)" }}>Deepseek AI</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              <a href="#" className="transition-colors duration-200" style={{ color: "var(--text-secondary)" }}>
                <Shield className="mr-2 w-4 h-4 inline" />Privacy
              </a>
              <a href="#" className="transition-colors duration-200" style={{ color: "var(--text-secondary)" }}>
                <FileText className="mr-2 w-4 h-4 inline" />Terms
              </a>
              <a href="#" className="transition-colors duration-200" style={{ color: "var(--text-secondary)" }}>
                <HelpCircle className="mr-2 w-4 h-4 inline" />Help
              </a>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-800 text-center">
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              © 2025 PitoyBot. Created by Kent Villar using Node.js, Express, and modern web technologies.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
