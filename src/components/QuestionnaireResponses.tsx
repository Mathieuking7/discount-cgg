import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Loader2 } from "lucide-react";

interface QuestionnaireResponse {
  id: string;
  question_text: string;
  answer_text: string;
  created_at: string;
}

interface QuestionnaireResponsesProps {
  demarcheId: string;
}

export function QuestionnaireResponses({ demarcheId }: QuestionnaireResponsesProps) {
  const [responses, setResponses] = useState<QuestionnaireResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResponses();
  }, [demarcheId]);

  const loadResponses = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('demarche_questionnaire_responses')
      .select('*')
      .eq('demarche_id', demarcheId)
      .order('created_at');

    if (!error && data) {
      setResponses(data);
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (responses.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          Réponses au questionnaire
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {responses.map((response, idx) => (
            <div key={response.id} className="flex flex-col gap-1 p-3 rounded-lg bg-muted/50">
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="shrink-0 mt-0.5">{idx + 1}</Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">
                    {response.question_text}
                  </p>
                  <p className="font-medium text-foreground mt-1">
                    {response.answer_text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
