import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';

interface CMSContent {
  id: string;
  section: string;
  content: any;
  updated_at: string;
}

export default function CMSControl() {
  const [content, setContent] = useState<{ [key: string]: CMSContent }>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Form states for different sections
  const [heroData, setHeroData] = useState({
    title: '',
    subtitle: '',
    cta: ''
  });

  const [featuresData, setFeaturesData] = useState({
    title: '',
    items: [
      { title: '', description: '' },
      { title: '', description: '' },
      { title: '', description: '' }
    ]
  });

  const [footerData, setFooterData] = useState({
    company: '',
    description: '',
    links: {
      about: '',
      contact: '',
      privacy: ''
    }
  });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('cms_content')
        .select('*');

      if (error) throw error;

      const contentMap: { [key: string]: CMSContent } = {};
      data?.forEach(item => {
        contentMap[item.section] = item;
      });

      setContent(contentMap);

      // Populate form states
      if (contentMap.hero) {
        setHeroData(contentMap.hero.content);
      }
      if (contentMap.features) {
        setFeaturesData(contentMap.features.content);
      }
      if (contentMap.footer) {
        const footerContent = contentMap.footer.content;
        setFooterData({
          company: footerContent?.company || '',
          description: footerContent?.description || '',
          links: {
            about: footerContent?.links?.about || '',
            contact: footerContent?.links?.contact || '',
            privacy: footerContent?.links?.privacy || ''
          }
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveContent = async (section: string, data: any) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('cms_content')
        .upsert({
          section,
          content: data,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `${section} content updated successfully`,
      });

      fetchContent();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading content...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">CMS Control</h3>
        <p className="text-muted-foreground">Manage website content and appearance</p>
      </div>

      <Tabs defaultValue="hero" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="hero">Hero Section</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
        </TabsList>

        <TabsContent value="hero">
          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="hero-title">Title</Label>
                <Input
                  id="hero-title"
                  value={heroData.title}
                  onChange={(e) => setHeroData({ ...heroData, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="hero-subtitle">Subtitle</Label>
                <Textarea
                  id="hero-subtitle"
                  value={heroData.subtitle}
                  onChange={(e) => setHeroData({ ...heroData, subtitle: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="hero-cta">Call to Action Text</Label>
                <Input
                  id="hero-cta"
                  value={heroData.cta}
                  onChange={(e) => setHeroData({ ...heroData, cta: e.target.value })}
                />
              </div>
              <Button onClick={() => saveContent('hero', heroData)} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>Features Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="features-title">Section Title</Label>
                <Input
                  id="features-title"
                  value={featuresData.title}
                  onChange={(e) => setFeaturesData({ ...featuresData, title: e.target.value })}
                />
              </div>
              {featuresData.items.map((item, index) => (
                <div key={index} className="border p-4 rounded-lg space-y-2">
                  <Label>Feature {index + 1}</Label>
                  <Input
                    placeholder="Feature title"
                    value={item.title}
                    onChange={(e) => {
                      const newItems = [...featuresData.items];
                      newItems[index].title = e.target.value;
                      setFeaturesData({ ...featuresData, items: newItems });
                    }}
                  />
                  <Textarea
                    placeholder="Feature description"
                    value={item.description}
                    onChange={(e) => {
                      const newItems = [...featuresData.items];
                      newItems[index].description = e.target.value;
                      setFeaturesData({ ...featuresData, items: newItems });
                    }}
                    rows={2}
                  />
                </div>
              ))}
              <Button onClick={() => saveContent('features', featuresData)} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="footer">
          <Card>
            <CardHeader>
              <CardTitle>Footer Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="footer-company">Company Name</Label>
                <Input
                  id="footer-company"
                  value={footerData.company}
                  onChange={(e) => setFooterData({ ...footerData, company: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="footer-description">Description</Label>
                <Textarea
                  id="footer-description"
                  value={footerData.description}
                  onChange={(e) => setFooterData({ ...footerData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="footer-about">About Link</Label>
                  <Input
                    id="footer-about"
                    value={footerData.links.about}
                    onChange={(e) => setFooterData({ 
                      ...footerData, 
                      links: { ...footerData.links, about: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="footer-contact">Contact Link</Label>
                  <Input
                    id="footer-contact"
                    value={footerData.links.contact}
                    onChange={(e) => setFooterData({ 
                      ...footerData, 
                      links: { ...footerData.links, contact: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="footer-privacy">Privacy Link</Label>
                  <Input
                    id="footer-privacy"
                    value={footerData.links.privacy}
                    onChange={(e) => setFooterData({ 
                      ...footerData, 
                      links: { ...footerData.links, privacy: e.target.value }
                    })}
                  />
                </div>
              </div>
              <Button onClick={() => saveContent('footer', footerData)} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}