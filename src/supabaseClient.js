import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jfrkihsftdzvxqafhmom.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmcmtpaHNmdGR6dnhxYWZobW9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMzU2MTQsImV4cCI6MjA4MzkxMTYxNH0.SCYYDPedzsNFigOVFoCKL_Ybi9P66a7RiQ_Z-JnE9sg'

export const supabase = createClient(supabaseUrl, supabaseKey)