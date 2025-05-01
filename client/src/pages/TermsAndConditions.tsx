import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function TermsAndConditions() {
  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl font-bold">Terms and Conditions</CardTitle>
          <p className="text-sm text-muted-foreground">Last updated: May 1, 2025</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-primary">1. Introduction</h2>
            <p>
              Welcome to WorkTrack, powered by Lighthouse. These Terms and Conditions govern your use of our web application and services provided by Solaire Manpower Agency. By accessing or using our application, you agree to be bound by these Terms and Conditions.
            </p>
          </div>

          <Separator />

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-primary">2. Definitions</h2>
            <p>
              <strong>"Application"</strong> refers to the WorkTrack web application.
            </p>
            <p>
              <strong>"Company"</strong> refers to Solaire Manpower Agency, the provider of the Application.
            </p>
            <p>
              <strong>"User"</strong> refers to any individual who accesses or uses the Application, including employees, managers, and administrators.
            </p>
            <p>
              <strong>"Services"</strong> refers to the functionality and features provided by the Application, including but not limited to employee management, DTR processing, and payroll generation.
            </p>
          </div>

          <Separator />
          
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-primary">3. Account Creation and Security</h2>
            <p>
              3.1. Users are responsible for maintaining the confidentiality of their account credentials.
            </p>
            <p>
              3.2. Users are responsible for all activities that occur under their account.
            </p>
            <p>
              3.3. Users must notify the Company immediately of any unauthorized use of their account or any other breach of security.
            </p>
            <p>
              3.4. The Company reserves the right to terminate accounts that violate these Terms and Conditions.
            </p>
          </div>

          <Separator />
          
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-primary">4. Use of the Application</h2>
            <p>
              4.1. Users must use the Application in compliance with all applicable laws and regulations.
            </p>
            <p>
              4.2. Users must not use the Application to engage in any activity that is illegal, fraudulent, or harmful.
            </p>
            <p>
              4.3. Users must not use the Application to distribute viruses, malware, or other malicious code.
            </p>
            <p>
              4.4. Users must not attempt to gain unauthorized access to any part of the Application or any server, system, or network connected to the Application.
            </p>
          </div>

          <Separator />
          
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-primary">5. Data Processing and Records</h2>
            <p>
              5.1. Users acknowledge that the Application processes and stores data related to employment, attendance, and payroll.
            </p>
            <p>
              5.2. Users are responsible for the accuracy of the data they input into the Application.
            </p>
            <p>
              5.3. The Company is not responsible for errors resulting from inaccurate or incomplete data provided by Users.
            </p>
            <p>
              5.4. The Company will take reasonable measures to ensure the security and integrity of data stored in the Application.
            </p>
          </div>

          <Separator />
          
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-primary">6. Intellectual Property</h2>
            <p>
              6.1. The Application and all its contents, features, and functionality are owned by the Company or its licensors and are protected by intellectual property laws.
            </p>
            <p>
              6.2. Users are granted a limited, non-exclusive, non-transferable license to use the Application for its intended purpose.
            </p>
            <p>
              6.3. Users may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on the Application, except as permitted by these Terms and Conditions.
            </p>
          </div>

          <Separator />
          
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-primary">7. Limitation of Liability</h2>
            <p>
              7.1. The Company shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from the use of or inability to use the Application.
            </p>
            <p>
              7.2. The Company shall not be liable for any loss or damage arising from unauthorized access to or use of your account.
            </p>
            <p>
              7.3. The Company shall not be liable for any loss or damage arising from your failure to comply with these Terms and Conditions.
            </p>
          </div>

          <Separator />
          
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-primary">8. Modifications to the Terms and Conditions</h2>
            <p>
              8.1. The Company reserves the right to modify these Terms and Conditions at any time.
            </p>
            <p>
              8.2. Users will be notified of significant changes to these Terms and Conditions.
            </p>
            <p>
              8.3. Continued use of the Application after any modifications to these Terms and Conditions constitutes acceptance of the modified Terms and Conditions.
            </p>
          </div>

          <Separator />
          
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-primary">9. Governing Law</h2>
            <p>
              These Terms and Conditions shall be governed by and construed in accordance with the laws of the Philippines, without regard to its conflict of law provisions.
            </p>
          </div>

          <Separator />
          
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-primary">10. Contact Information</h2>
            <p>
              For questions about these Terms and Conditions, please contact us at:
            </p>
            <p>
              Solaire Manpower Agency<br />
              123 Business Avenue, Makati City, Philippines<br />
              Email: support@solaire-manpower.com<br />
              Phone: +63 (2) 1234-5678
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}