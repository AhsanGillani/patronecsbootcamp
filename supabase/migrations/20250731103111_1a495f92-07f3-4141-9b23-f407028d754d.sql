-- Update existing courses to approved status and add proper data
UPDATE courses 
SET status = 'approved', 
    title = CASE 
        WHEN id = 'da985069-459c-41bc-be37-0167b427f798' THEN 'Advanced React Development'
        WHEN id = '912e3ea9-183b-4f67-a912-f27f11f552cd' THEN 'JavaScript Fundamentals'
        WHEN id = '6272e34a-d417-48e8-9640-657cdd9e138c' THEN 'Node.js Backend Development'
        ELSE title
    END,
    description = CASE 
        WHEN id = 'da985069-459c-41bc-be37-0167b427f798' THEN 'Master advanced React concepts including hooks, context, and performance optimization techniques.'
        WHEN id = '912e3ea9-183b-4f67-a912-f27f11f552cd' THEN 'Learn the core concepts of JavaScript programming from basics to advanced topics.'
        WHEN id = '6272e34a-d417-48e8-9640-657cdd9e138c' THEN 'Build scalable backend applications using Node.js, Express, and modern development practices.'
        ELSE description
    END,
    category_id = CASE 
        WHEN id = 'da985069-459c-41bc-be37-0167b427f798' THEN '2b95d318-c3f0-4dec-b50f-a73dfdc5ee4e'
        WHEN id = '912e3ea9-183b-4f67-a912-f27f11f552cd' THEN '2b95d318-c3f0-4dec-b50f-a73dfdc5ee4e'
        WHEN id = '6272e34a-d417-48e8-9640-657cdd9e138c' THEN '2b95d318-c3f0-4dec-b50f-a73dfdc5ee4e'
        ELSE category_id
    END,
    level = 'intermediate',
    price = 99.99,
    lesson_count = 12,
    total_duration = 720,
    soft_deleted = false
WHERE id IN ('da985069-459c-41bc-be37-0167b427f798', '912e3ea9-183b-4f67-a912-f27f11f552cd', '6272e34a-d417-48e8-9640-657cdd9e138c');

-- Update existing blogs to approved and published status
UPDATE blogs 
SET status = 'approved',
    is_published = true,
    title = CASE 
        WHEN id = 'fd0768fc-a9c9-4e0f-91b0-a97defac0376' THEN 'Getting Started with Modern Web Development'
        WHEN id = '6cca9beb-593d-48ae-869e-2fa3525ce357' THEN 'The Future of Data Science in 2024'
        ELSE title
    END,
    content = CASE 
        WHEN id = 'fd0768fc-a9c9-4e0f-91b0-a97defac0376' THEN '<p>Modern web development has evolved significantly over the past few years. With the rise of frameworks like React, Vue, and Angular, developers now have powerful tools to build dynamic and interactive web applications.</p><p>In this article, we''ll explore the key concepts and best practices for getting started with modern web development, including component-based architecture, state management, and responsive design principles.</p>'
        WHEN id = '6cca9beb-593d-48ae-869e-2fa3525ce357' THEN '<p>Data science continues to be one of the fastest-growing fields in technology. As we move through 2024, we''re seeing exciting developments in machine learning, artificial intelligence, and data visualization.</p><p>This comprehensive guide covers the latest trends, tools, and techniques that are shaping the future of data science and what it means for professionals in the field.</p>'
        ELSE content
    END,
    excerpt = CASE 
        WHEN id = 'fd0768fc-a9c9-4e0f-91b0-a97defac0376' THEN 'Discover the essential concepts and best practices for modern web development with React, Vue, and Angular.'
        WHEN id = '6cca9beb-593d-48ae-869e-2fa3525ce357' THEN 'Explore the latest trends and developments in data science for 2024 and beyond.'
        ELSE excerpt
    END,
    views = FLOOR(RANDOM() * 1000) + 50
WHERE id IN ('fd0768fc-a9c9-4e0f-91b0-a97defac0376', '6cca9beb-593d-48ae-869e-2fa3525ce357');

-- Insert additional sample courses using the correct instructor profile user_id
INSERT INTO courses (title, description, instructor_id, category_id, status, level, price, lesson_count, total_duration, soft_deleted) VALUES
('UI/UX Design Fundamentals', 'Learn the principles of user interface and user experience design to create beautiful and functional digital products.', '3a4d88a7-32ed-4230-84cf-0df9e3920b7b', '28c656cf-e624-4a73-9d6d-302a12dfcd82', 'approved', 'beginner', 79.99, 8, 480, false),
('Digital Photography Mastery', 'Master the art of digital photography with hands-on lessons covering composition, lighting, and post-processing techniques.', '3a4d88a7-32ed-4230-84cf-0df9e3920b7b', 'f53e403d-03b9-497e-9d02-a7d424530e5d', 'approved', 'intermediate', 149.99, 15, 900, false),
('Business Strategy & Analytics', 'Develop strategic thinking skills and learn to use data analytics to drive business decisions and growth.', '3a4d88a7-32ed-4230-84cf-0df9e3920b7b', 'a78e1f64-d980-409e-9043-2e5a5470ebd8', 'approved', 'advanced', 199.99, 20, 1200, false),
('Machine Learning Fundamentals', 'Introduction to machine learning algorithms, data preprocessing, and model evaluation using Python and popular libraries.', '3a4d88a7-32ed-4230-84cf-0df9e3920b7b', 'ff03abcd-31eb-4069-b5ea-8c6783cd4760', 'approved', 'intermediate', 179.99, 18, 1080, false);

-- Insert additional sample blogs using the correct author profile user_id
INSERT INTO blogs (title, content, excerpt, author_id, category_id, status, is_published, featured_image_url, views) VALUES
('10 Essential Design Principles Every Developer Should Know', '<p>Great design is not just about making things look pretty—it''s about creating intuitive, accessible, and effective user experiences. As a developer, understanding fundamental design principles can significantly improve the quality of your work.</p><p>In this comprehensive guide, we''ll explore 10 essential design principles that every developer should master, from visual hierarchy and typography to color theory and user psychology.</p>', 'Discover the fundamental design principles that will elevate your development skills and create better user experiences.', '3a4d88a7-32ed-4230-84cf-0df9e3920b7b', '28c656cf-e624-4a73-9d6d-302a12dfcd82', 'approved', true, '/placeholder.svg', 342),
('Building Your Photography Portfolio: A Complete Guide', '<p>Creating a compelling photography portfolio is essential for any photographer looking to showcase their work and attract potential clients. Whether you''re a beginner or an experienced photographer, having a well-curated portfolio can make all the difference.</p><p>This guide covers everything from selecting your best work to presenting it effectively across different platforms and mediums.</p>', 'Learn how to create a stunning photography portfolio that showcases your skills and attracts potential clients.', '3a4d88a7-32ed-4230-84cf-0df9e3920b7b', 'f53e403d-03b9-497e-9d02-a7d424530e5d', 'approved', true, '/placeholder.svg', 156),
('The Rise of Remote Work: Transforming Business Operations', '<p>The global shift towards remote work has fundamentally changed how businesses operate. Companies worldwide are adapting their strategies, processes, and cultures to accommodate distributed teams and digital-first operations.</p><p>This article examines the long-term implications of remote work on business strategy, employee productivity, and organizational culture.</p>', 'Explore how remote work is reshaping modern business operations and what it means for the future of work.', '3a4d88a7-32ed-4230-84cf-0df9e3920b7b', 'a78e1f64-d980-409e-9043-2e5a5470ebd8', 'approved', true, '/placeholder.svg', 289),
('Getting Started with Python for Data Analysis', '<p>Python has become the go-to language for data analysis and data science. Its simple syntax, powerful libraries, and active community make it an ideal choice for both beginners and experienced analysts.</p><p>In this tutorial, we''ll walk through the essential Python libraries for data analysis, including pandas, numpy, and matplotlib, with practical examples and best practices.</p>', 'Learn the fundamentals of Python for data analysis with practical examples and essential libraries.', '3a4d88a7-32ed-4230-84cf-0df9e3920b7b', 'ff03abcd-31eb-4069-b5ea-8c6783cd4760', 'approved', true, '/placeholder.svg', 423);