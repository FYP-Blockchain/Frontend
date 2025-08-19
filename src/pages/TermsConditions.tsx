import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, FileText, Shield, Users, Gavel, AlertTriangle } from "lucide-react";

const TermsConditions = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Scale className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Terms & Conditions</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            These terms govern your use of NFTickets platform and the purchase of NFT-based event tickets.
          </p>
          <div className="text-sm text-muted-foreground mt-2">
            Last updated: March 2024
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Acceptance of Terms */}
          <Card className="bg-glass/80 backdrop-blur-glass border-glass-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                By accessing or using the NFTickets platform, creating an account, or purchasing tickets, 
                you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not 
                agree to these terms, please do not use our services.
              </p>
              
              <div>
                <h4 className="font-semibold mb-2">Platform Description</h4>
                <p className="text-sm text-muted-foreground">
                  NFTickets is a blockchain-based ticketing platform that provides secure, verifiable 
                  event tickets as Non-Fungible Tokens (NFTs). Our platform connects event organizers 
                  with attendees through smart contracts and decentralized technology.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Eligibility</h4>
                <p className="text-sm text-muted-foreground">
                  You must be at least 18 years old or have parental consent to use our services. 
                  By using NFTickets, you represent and warrant that you meet these requirements.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* User Accounts */}
          <Card className="bg-glass/80 backdrop-blur-glass border-glass-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                User Accounts & Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Account Security</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>You are responsible for maintaining the security of your account credentials</li>
                  <li>You must provide accurate and complete information during registration</li>
                  <li>You are liable for all activities that occur under your account</li>
                  <li>Notify us immediately of any unauthorized access or security breaches</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Wallet Integration</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>You are solely responsible for your cryptocurrency wallet and private keys</li>
                  <li>We cannot recover lost or stolen wallet access or private keys</li>
                  <li>Ensure your wallet is compatible with our supported blockchain networks</li>
                  <li>Transaction fees (gas fees) are your responsibility</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Prohibited Activities</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Creating multiple accounts to circumvent limitations</li>
                  <li>Using automated systems to purchase tickets (bots)</li>
                  <li>Attempting to hack, disrupt, or compromise platform security</li>
                  <li>Violating any applicable laws or regulations</li>
                  <li>Engaging in fraudulent or misleading activities</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* NFT Tickets */}
          <Card className="bg-glass/80 backdrop-blur-glass border-glass-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                NFT Tickets & Blockchain Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">NFT Ownership</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>NFT tickets represent a license to attend specific events</li>
                  <li>Ownership is recorded on the blockchain and cannot be duplicated</li>
                  <li>You may transfer or sell NFT tickets according to smart contract terms</li>
                  <li>Event organizers may impose additional restrictions on transfers</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Smart Contract Terms</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>All transactions are governed by immutable smart contracts</li>
                  <li>Once confirmed on the blockchain, transactions cannot be reversed</li>
                  <li>Smart contract code is publicly verifiable on the blockchain</li>
                  <li>Network congestion may delay transaction confirmation</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Blockchain Risks</h4>
                <p className="text-sm text-muted-foreground">
                  Blockchain transactions are irreversible. You acknowledge and accept the risks 
                  associated with blockchain technology, including but not limited to network forks, 
                  technical vulnerabilities, and regulatory changes.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Purchases & Payments */}
          <Card className="bg-glass/80 backdrop-blur-glass border-glass-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gavel className="h-5 w-5 mr-2" />
                Purchases, Payments & Refunds
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Payment Terms</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>All prices are displayed in the currency specified at checkout</li>
                  <li>You are responsible for all applicable taxes and fees</li>
                  <li>Payment must be completed before ticket issuance</li>
                  <li>We reserve the right to cancel transactions for security reasons</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Refund Policy</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Refunds are subject to event organizer policies</li>
                  <li>Cancelled events will receive full refunds minus processing fees</li>
                  <li>Refund processing time depends on the original payment method</li>
                  <li>NFT tickets must be returned to our smart contract for refund processing</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Event Changes</h4>
                <p className="text-sm text-muted-foreground">
                  Event organizers may modify event details, dates, or venues. Significant changes 
                  will be communicated via email and may qualify for refunds at the organizer's discretion.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Platform Availability */}
          <Card className="bg-glass/80 backdrop-blur-glass border-glass-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Service Availability & Limitations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Platform Availability</h4>
                <p className="text-sm text-muted-foreground">
                  We strive to maintain 99.9% uptime but cannot guarantee uninterrupted service. 
                  Scheduled maintenance will be announced in advance when possible. We are not 
                  liable for losses due to platform downtime.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Third-Party Dependencies</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Our service depends on blockchain networks and third-party providers</li>
                  <li>Network outages or delays may affect ticket purchases and transfers</li>
                  <li>Payment processor issues may temporarily prevent purchases</li>
                  <li>We are not responsible for third-party service interruptions</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Limitation of Liability</h4>
                <p className="text-sm text-muted-foreground">
                  Our liability is limited to the amount paid for tickets. We are not liable for 
                  indirect, incidental, or consequential damages including lost profits, data loss, 
                  or business interruption.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card className="bg-glass/80 backdrop-blur-glass border-glass-border">
            <CardHeader>
              <CardTitle>Intellectual Property Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Platform Content</h4>
                <p className="text-sm text-muted-foreground">
                  All platform content, including logos, designs, text, graphics, and software, 
                  is owned by NFTickets or licensed to us. You may not copy, modify, or distribute 
                  our content without written permission.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">User Content</h4>
                <p className="text-sm text-muted-foreground">
                  You retain ownership of content you submit but grant us a license to use, display, 
                  and distribute it on our platform. You are responsible for ensuring you have rights 
                  to any content you upload.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card className="bg-glass/80 backdrop-blur-glass border-glass-border">
            <CardHeader>
              <CardTitle>Governing Law & Dispute Resolution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Jurisdiction</h4>
                <p className="text-sm text-muted-foreground">
                  These terms are governed by the laws of [Your Jurisdiction]. Any disputes will be 
                  resolved in the courts of [Your Jurisdiction] or through binding arbitration.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Changes to Terms</h4>
                <p className="text-sm text-muted-foreground">
                  We may update these terms periodically. Significant changes will be communicated 
                  via email or platform notifications. Continued use after changes indicates acceptance 
                  of new terms.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-glass/80 backdrop-blur-glass border-glass-border">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                For questions about these Terms and Conditions, please contact us:
              </p>
              <div className="space-y-2 text-sm">
                <div><strong>Email:</strong> legal@nftickets.com</div>
                <div><strong>Phone:</strong> +94 760010340</div>
                <div><strong>Address:</strong> NFTickets Legal Department, 123 Tech Street, Blockchain City</div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                We will respond to legal inquiries within 5 business days.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;