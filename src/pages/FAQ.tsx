import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, HelpCircle } from "lucide-react";

const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          id: "1",
          question: "How do I create an account?",
          answer: "To create an account, click on the 'Sign up' button in the top right corner of the homepage. Fill in your email, password, and full name. You'll be redirected to your dashboard once your account is created."
        },
        {
          id: "2", 
          question: "Are all courses really free?",
          answer: "Yes! All courses on Patronecs are completely free. We believe education should be accessible to everyone, regardless of their financial situation."
        },
        {
          id: "3",
          question: "Do I get a certificate after completing a course?",
          answer: "Yes, you'll receive a certificate of completion for every course you finish. Certificates are automatically generated and can be downloaded from your student dashboard."
        }
      ]
    },
    {
      category: "Courses",
      questions: [
        {
          id: "4",
          question: "How do I enroll in a course?",
          answer: "Simply browse to any course page and click the 'Enroll Free' button. You'll need to be logged in to enroll. Once enrolled, you can access all course materials immediately."
        },
        {
          id: "5",
          question: "Can I take multiple courses at the same time?",
          answer: "Absolutely! You can enroll in as many courses as you'd like and learn at your own pace. There are no restrictions on the number of courses you can take simultaneously."
        },
        {
          id: "6",
          question: "How long do I have access to a course?",
          answer: "Once you enroll in a course, you have lifetime access to all course materials. You can revisit lessons, quizzes, and resources anytime you want."
        },
        {
          id: "7",
          question: "What if I'm not satisfied with a course?",
          answer: "Since our courses are free, there's no financial risk. However, we're committed to quality education. If you have feedback about a course, please contact us so we can improve."
        }
      ]
    },
    {
      category: "Technical Support",
      questions: [
        {
          id: "8",
          question: "What if I'm having trouble accessing course materials?",
          answer: "If you're experiencing technical difficulties, try refreshing your browser or clearing your cache. If the problem persists, contact our support team with details about the issue."
        },
        {
          id: "9",
          question: "Can I access courses on mobile devices?",
          answer: "Yes! Our platform is fully responsive and works on all devices including smartphones and tablets. You can learn anywhere, anytime."
        },
        {
          id: "10",
          question: "Do I need any special software to take courses?",
          answer: "No special software is required. All you need is a modern web browser and an internet connection. Some programming courses may recommend specific tools, but installation guides are provided."
        }
      ]
    },
    {
      category: "For Instructors",
      questions: [
        {
          id: "11",
          question: "How can I become an instructor?",
          answer: "To become an instructor, contact our team through the 'Teach on Patronecs' link. We'll review your qualifications and help you get started with creating your first course."
        },
        {
          id: "12",
          question: "What are the requirements for creating a course?",
          answer: "Instructors should have expertise in their subject area and be committed to creating high-quality educational content. All courses go through a review process before being published."
        },
        {
          id: "13",
          question: "How long does it take to get a course approved?",
          answer: "Course review typically takes 5-10 business days. We review content quality, accuracy, and ensure it meets our educational standards."
        }
      ]
    }
  ];

  const filteredFAQs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        {/* Header Section */}
        <section className="py-12 bg-hero-gradient">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <HelpCircle className="h-16 w-16 text-primary mx-auto mb-6" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Frequently Asked <span className="text-primary">Questions</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Find answers to common questions about Patronecs
              </p>
              
              {/* Search */}
              <div className="bg-background/80 backdrop-blur-sm rounded-lg p-6 border border-border max-w-2xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search FAQs..."
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {filteredFAQs.length > 0 ? (
                <div className="space-y-8">
                  {filteredFAQs.map((category) => (
                    <Card key={category.category} className="p-6 bg-card-gradient">
                      <h2 className="text-2xl font-semibold mb-6 text-primary">
                        {category.category}
                      </h2>
                      
                      <Accordion type="single" collapsible className="space-y-4">
                        {category.questions.map((faq) => (
                          <AccordionItem 
                            key={faq.id} 
                            value={faq.id}
                            className="border border-border rounded-lg px-4"
                          >
                            <AccordionTrigger className="text-left hover:text-primary">
                              {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground pt-4">
                              {faq.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold mb-2">No FAQs found</h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your search query or browse all categories.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Still have questions?</h2>
              <p className="text-muted-foreground mb-8">
                Can't find what you're looking for? Get in touch with our support team.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
                >
                  Contact Support
                </a>
                <a
                  href="mailto:support@patronecs.com"
                  className="inline-flex items-center justify-center px-6 py-3 border border-border rounded-md shadow-sm text-base font-medium text-foreground bg-background hover:bg-muted transition-colors"
                >
                  Email Us
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;