import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl font-bold">Privacy Policy</CardTitle>
          <p className="text-sm text-muted-foreground">Last updated: May 1, 2025</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-primary">1. Introduction</h2>
            <p>
              WorkTrack, powered by Lighthouse ("we", "our", or "us"), respects your privacy and is committed to protecting your personal data. This Privacy Policy will inform you how we handle your personal data when you use our application (WorkTrack) and tell you about your privacy rights and how the law protects you.
            </p>
            <p>
              This Privacy Policy applies to all users of WorkTrack, including employees, managers, and administrators, and is operated by Solaire Manpower Agency.
            </p>
          </div>

          <Separator />

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-primary">2. Data We Collect</h2>
            <p>
              We collect and process the following categories of personal data:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>
                <strong>Identification Information:</strong> Name, employee ID, profile picture, and other identifying information.
              </li>
              <li>
                <strong>Contact Information:</strong> Email address, phone number, and physical address.
              </li>
              <li>
                <strong>Employment Information:</strong> Position, department, company, employment status, date hired, and salary information.
              </li>
              <li>
                <strong>Attendance Information:</strong> Time-in and time-out records, DTR (Daily Time Record) data, and leave records.
              </li>
              <li>
                <strong>Financial Information:</strong> Salary details, tax information, and payroll records.
              </li>
              <li>
                <strong>Authentication Information:</strong> Username, password (encrypted), and account security information.
              </li>
              <li>
                <strong>Technical Information:</strong> IP address, browser type and version, time zone setting, operating system, and device information.
              </li>
              <li>
                <strong>Usage Information:</strong> Information about how you use our Application, including page views, feature usage, and session duration.
              </li>
            </ul>
          </div>

          <Separator />
          
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-primary">3. How We Collect Your Data</h2>
            <p>
              We collect your personal data through:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>
                <strong>Direct Interactions:</strong> Information you provide when creating an account, updating your profile, submitting DTR records, or using our application.
              </li>
              <li>
                <strong>Automated Technologies:</strong> As you interact with our Application, we may automatically collect technical data about your equipment, browsing actions, and patterns.
              </li>
              <li>
                <strong>Third Parties:</strong> We may receive personal data about you from your employer, government agencies (for tax purposes), or other authorized entities.
              </li>
            </ul>
          </div>

          <Separator />
          
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-primary">4. How We Use Your Data</h2>
            <p>
              We use your personal data for the following purposes:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>
                <strong>Account Management:</strong> To create and maintain your account, authenticate your identity, and manage your profile.
              </li>
              <li>
                <strong>Employment Management:</strong> To manage employee records, track attendance, process payroll, and facilitate other employment-related functions.
              </li>
              <li>
                <strong>Service Improvement:</strong> To analyze usage patterns, troubleshoot issues, and improve our services.
              </li>
              <li>
                <strong>Communication:</strong> To send notifications, updates, and respond to your inquiries.
              </li>
              <li>
                <strong>Legal Compliance:</strong> To comply with legal obligations, such as tax reporting and labor law requirements.
              </li>
              <li>
                <strong>Security:</strong> To detect, prevent, and address technical issues or security breaches.
              </li>
            </ul>
          </div>

          <Separator />
          
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-primary">5. Legal Basis for Processing</h2>
            <p>
              We process your personal data based on the following legal grounds:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>
                <strong>Contractual Necessity:</strong> Processing is necessary for the performance of a contract to which you are a party (employment contract).
              </li>
              <li>
                <strong>Legal Obligation:</strong> Processing is necessary for compliance with a legal obligation to which we are subject.
              </li>
              <li>
                <strong>Legitimate Interests:</strong> Processing is necessary for our legitimate interests or those of a third party, except where such interests are overridden by your fundamental rights and freedoms.
              </li>
              <li>
                <strong>Consent:</strong> In some cases, we may process your data based on your explicit consent.
              </li>
            </ul>
          </div>

          <Separator />
          
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-primary">6. Data Sharing and Recipients</h2>
            <p>
              We may share your personal data with:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>
                <strong>Your Employer:</strong> As our Application is used for workforce management, your data may be accessed by authorized personnel within your employing organization.
              </li>
              <li>
                <strong>Service Providers:</strong> We may share your data with third-party service providers who perform services on our behalf, such as hosting providers, payment processors, and IT support.
              </li>
              <li>
                <strong>Government Authorities:</strong> We may share your data with government authorities when required by law, such as tax authorities or labor departments.
              </li>
              <li>
                <strong>Professional Advisers:</strong> We may share your data with professional advisers, such as lawyers, accountants, and insurers, when necessary.
              </li>
            </ul>
            <p>
              We require all third parties to respect the security of your personal data and to treat it in accordance with the law.
            </p>
          </div>

          <Separator />
          
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-primary">7. Data Security</h2>
            <p>
              We have implemented appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed. These measures include:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Encryption of sensitive data</li>
              <li>Secure user authentication</li>
              <li>Regular security assessments</li>
              <li>Access controls and user permissions</li>
              <li>Data backup procedures</li>
              <li>Staff training on data security</li>
            </ul>
            <p>
              We have procedures to deal with any suspected personal data breach and will notify you and any applicable regulator of a breach where we are legally required to do so.
            </p>
          </div>

          <Separator />
          
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-primary">8. Data Retention</h2>
            <p>
              We will retain your personal data only for as long as necessary to fulfill the purposes for which we collected it, including for the purposes of satisfying any legal, accounting, or reporting requirements.
            </p>
            <p>
              Different types of data may have different retention periods:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>
                <strong>Employment Records:</strong> Generally retained for the duration of employment plus any additional period required by law.
              </li>
              <li>
                <strong>Payroll Records:</strong> Typically retained for the period prescribed by tax laws and labor regulations.
              </li>
              <li>
                <strong>Authentication Data:</strong> Retained until account closure or deletion.
              </li>
              <li>
                <strong>Technical and Usage Data:</strong> May be retained for a shorter period for analytical purposes.
              </li>
            </ul>
          </div>

          <Separator />
          
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-primary">9. Your Rights</h2>
            <p>
              Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>
                <strong>Access:</strong> Request access to your personal data.
              </li>
              <li>
                <strong>Correction:</strong> Request correction of inaccurate or incomplete personal data.
              </li>
              <li>
                <strong>Erasure:</strong> Request deletion of your personal data in certain circumstances.
              </li>
              <li>
                <strong>Restrict Processing:</strong> Request restriction of processing of your personal data.
              </li>
              <li>
                <strong>Data Portability:</strong> Request the transfer of your personal data to you or a third party.
              </li>
              <li>
                <strong>Object:</strong> Object to processing of your personal data in certain circumstances.
              </li>
              <li>
                <strong>Withdraw Consent:</strong> Withdraw consent where we are processing your personal data based on consent.
              </li>
            </ul>
            <p>
              To exercise any of these rights, please contact us using the contact information provided below.
            </p>
          </div>

          <Separator />
          
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-primary">10. Changes to this Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Any changes will be posted on this page, and we will notify you of significant changes by email or through a notice on our Application.
            </p>
          </div>

          <Separator />
          
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-primary">11. Contact Information</h2>
            <p>
              If you have any questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <p>
              Solaire Manpower Agency<br />
              123 Business Avenue, Makati City, Philippines<br />
              Email: privacy@solaire-manpower.com<br />
              Phone: +63 (2) 1234-5678
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}