import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Eye, Database, Lock, Users, Globe } from "lucide-react";
import useSmoothScrollToTop from "@/hooks/useSmoothScrollToTop";

const PrivacyPolicy = () => {
  useSmoothScrollToTop();
  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information when using NFTickets.
          </p>
          <div className="text-sm text-muted-foreground mt-2">
            Last updated: March 2024
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Information We Collect */}
          <Card className="bg-glass/80 backdrop-blur-glass border-glass-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Personal Information</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Account information (username, email address, password)</li>
                  <li>Profile information you choose to provide</li>
                  <li>Communication preferences and settings</li>
                  <li>Support requests and correspondence</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Transaction Information</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Ticket purchase history and payment information</li>
                  <li>Wallet addresses and blockchain transaction data</li>
                  <li>Event attendance and ticket usage</li>
                  <li>NFT ownership and transfer records</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Technical Information</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Device information and browser type</li>
                  <li>IP address and location data</li>
                  <li>Usage patterns and platform interactions</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Your Information */}
          <Card className="bg-glass/80 backdrop-blur-glass border-glass-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Platform Services</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Process ticket purchases and manage your account</li>
                  <li>Generate and manage NFT tickets on the blockchain</li>
                  <li>Provide customer support and respond to inquiries</li>
                  <li>Send important updates about events and purchases</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Security and Compliance</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Verify identity and prevent fraud</li>
                  <li>Comply with legal obligations and regulations</li>
                  <li>Detect and prevent unauthorized access</li>
                  <li>Maintain platform security and integrity</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Improvement and Analytics</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Analyze platform usage to improve our services</li>
                  <li>Develop new features and functionality</li>
                  <li>Personalize your experience (with your consent)</li>
                  <li>Send marketing communications (if opted in)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Data Protection */}
          <Card className="bg-glass/80 backdrop-blur-glass border-glass-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                Data Protection & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Blockchain Security</h4>
                <p className="text-sm text-muted-foreground">
                  NFT tickets and transaction data are secured by blockchain technology, providing immutable 
                  records and preventing tampering. Wallet addresses and transaction hashes are publicly 
                  visible on the blockchain but cannot be modified.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Data Encryption</h4>
                <p className="text-sm text-muted-foreground">
                  All personal information is encrypted both in transit and at rest using industry-standard 
                  encryption protocols. Payment information is processed through secure, PCI-compliant 
                  payment processors.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Access Controls</h4>
                <p className="text-sm text-muted-foreground">
                  Access to personal information is restricted to authorized personnel only and subject to 
                  strict confidentiality agreements. We regularly review and update our security measures.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Data Sharing */}
          <Card className="bg-glass/80 backdrop-blur-glass border-glass-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Data Sharing & Third Parties
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Service Providers</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  We work with trusted service providers to operate our platform:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Payment processors (Stripe, PayPal) for secure transactions</li>
                  <li>Cloud infrastructure providers for data storage and hosting</li>
                  <li>Analytics services to understand platform usage</li>
                  <li>Customer support tools to provide assistance</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Event Organizers</h4>
                <p className="text-sm text-muted-foreground">
                  When you purchase tickets, necessary information (name, email, ticket details) may be 
                  shared with event organizers for event management purposes. Organizers are bound by 
                  their own privacy policies.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Legal Requirements</h4>
                <p className="text-sm text-muted-foreground">
                  We may disclose information when required by law, court order, or to protect our rights, 
                  property, or safety, or that of our users or others.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card className="bg-glass/80 backdrop-blur-glass border-glass-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Your Rights & Choices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Account Control</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Update your account information and preferences</li>
                  <li>Control communication and notification settings</li>
                  <li>Export your data in a portable format</li>
                  <li>Delete your account (subject to legal requirements)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Data Rights (GDPR/CCPA)</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Request access to your personal information</li>
                  <li>Request correction of inaccurate data</li>
                  <li>Request deletion of personal information</li>
                  <li>Object to processing for marketing purposes</li>
                  <li>Request data portability</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Blockchain Considerations</h4>
                <p className="text-sm text-muted-foreground">
                  Please note that information recorded on the blockchain (such as NFT ownership and 
                  transactions) cannot be deleted or modified due to the immutable nature of blockchain 
                  technology.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-glass/80 backdrop-blur-glass border-glass-border">
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                If you have questions about this Privacy Policy or wish to exercise your rights, please contact us:
              </p>
              <div className="space-y-2 text-sm">
                <div><strong>Email:</strong> privacy@nftickets.com</div>
                <div><strong>Phone:</strong> +94 760010340</div>
                <div><strong>Address:</strong> NFTickets Privacy Office, 123 Tech Street, Blockchain City</div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                We will respond to your requests within 30 days as required by applicable privacy laws.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;