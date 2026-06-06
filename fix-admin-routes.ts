import fs from 'fs';
import path from 'path';

const routes = [
  'app/api/admin/stats/route.ts',
  'app/api/admin/finance-compare/route.ts',
  'app/api/admin/renewals/route.ts',
  'app/api/admin/members/expiring/route.ts',
  'app/api/admin/members/expired/route.ts',
];

for (const file of routes) {
  const filePath = path.join(process.cwd(), file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix GET signature
  if (content.includes('export async function GET()')) {
    content = content.replace('export async function GET()', 'import { NextRequest } from "next/server";\nexport async function GET(request: NextRequest)');
  }

  // Handle existing NextRequest import if duplicated
  if (content.split('import { NextRequest }').length > 2) {
    // We can just rely on NextRequest from next/server
    content = content.replace(/import \{ NextRequest \} from "next\/server";\nimport \{ NextRequest \} from "next\/server";/g, 'import { NextRequest } from "next/server";');
  }

  // Fix hardcoded auth.organizationId
  const oldOrgId = 'const { organizationId } = auth;';
  const newOrgId = `const { organizationId: authOrgId } = auth;\n    const organizationId = request.headers.get("x-organization-id") || authOrgId;`;
  
  if (content.includes(oldOrgId)) {
    content = content.replace(oldOrgId, newOrgId);
  }

  fs.writeFileSync(filePath, content);
  console.log(`Fixed ${file}`);
}
